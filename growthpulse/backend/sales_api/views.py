# sales_api/views.py

import datetime
# sales_api/views.py
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .mongo_connection import sales_collection
import re,traceback
from prophet import Prophet



class UploadSalesView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Detect file type and read
            if file_obj.name.endswith(".csv"):
                df = pd.read_csv(file_obj)
            elif file_obj.name.endswith((".xls", ".xlsx")):
                df = pd.read_excel(file_obj)
            else:
                return Response({"error": "Only CSV or Excel files are supported"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Normalize column names to lowercase
            df.columns = df.columns.str.strip().str.lower()

            # Try to find the month column
            month_col = None
            for col in df.columns:
                if re.search(r"month|mon", col):
                    month_col = col
                    break

            # Try to find the sales column
            sales_col = None
            for col in df.columns:
                if re.search(r"sales|sale|amount|revenue|saless", col):
                    sales_col = col
                    break

            if not month_col or not sales_col:
                return Response({"error": "Could not detect month and sales columns in file"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Keep only required columns
            df = df[[month_col, sales_col]].copy()
            df.columns = ["month", "sales"]

            # Clean data
            df["month"] = df["month"].astype(str).str.strip()
            df["sales"] = pd.to_numeric(df["sales"], errors="coerce")
            df = df.dropna(subset=["month", "sales"])
            df = df[df["sales"] >= 0]

            if df.empty:
                return Response({"error": "No valid sales data found after cleaning"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Replace old data in DB
            sales_collection.delete_many({})
            sales_collection.insert_many(df.to_dict(orient="records"))

            # ----- KPI CALCULATION -----
            total_sales = df["sales"].sum()
            avg_sales = df["sales"].mean()
            best_month_row = df.loc[df["sales"].idxmax()]
            worst_month_row = df.loc[df["sales"].idxmin()]

            # Growth % from first month to last month
            try:
                first_sales = df.iloc[0]["sales"]
                last_sales = df.iloc[-1]["sales"]
                growth_pct = ((last_sales - first_sales) / first_sales * 100) if first_sales != 0 else 0
            except:
                growth_pct = 0

            kpi_summary = {
                "total_sales": round(total_sales, 2),
                "average_sales": round(avg_sales, 2),
                "best_month": best_month_row["month"],
                "best_month_sales": round(best_month_row["sales"], 2),
                "worst_month": worst_month_row["month"],
                "worst_month_sales": round(worst_month_row["sales"], 2),
                "growth_percentage": round(growth_pct, 2)
            }

            return Response({
                "message": "Sales data uploaded and cleaned successfully!",
                "rows_inserted": len(df),
                "kpi_summary": kpi_summary
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetSalesDataView(APIView):
    def get(self, request):
        try:
            data = list(sales_collection.find({}, {"_id": 0}))
            if not data:
                return Response([], status=status.HTTP_200_OK)

            # Keep only month and sales columns
            clean_data = []
            for row in data:
                month = row.get("month") or row.get("Month") or row.get("mon")
                sales = row.get("sales") or row.get("Sales") or row.get("saless")
                if month and sales:
                    clean_data.append({"month": str(month), "sales": float(sales)})

            return Response(clean_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from dateutil import parser
import datetime

class SimulateSalesView(APIView):
    def post(self, request):
        try:
            # Safe parsing of params
            try:
                growth_rate = float(request.data.get("growth_rate", 0.05))
            except (ValueError, TypeError):
                growth_rate = 0.05

            try:
                months = int(request.data.get("months", 6))
            except (ValueError, TypeError):
                months = 6

            # Get latest sales record
            last_sale_data = sales_collection.find_one(sort=[("month", -1)])
            if not last_sale_data:
                return Response({"error": "No sales data found"}, status=status.HTTP_400_BAD_REQUEST)

            last_sales = float(last_sale_data.get("sales", 0))
            last_month_str = last_sale_data.get("month")

            # Flexible date parsing
            try:
                last_month_date = parser.parse(last_month_str)
            except Exception:
                return Response({"error": f"Invalid date format: {last_month_str}"}, status=status.HTTP_400_BAD_REQUEST)

            # Forecast loop
            forecast_data = []
            for i in range(1, months + 1):
                new_sales = last_sales * (1 + growth_rate)
                new_date = last_month_date + datetime.timedelta(days=30 * i)
                forecast_data.append({
                    "month": new_date.strftime("%b %Y"),
                    "sales": round(new_sales, 2)
                })
                last_sales = new_sales

            return Response(forecast_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ForecastSalesView(APIView):
    def get(self, request):
        try:
            # Fetch data from MongoDB
            data = list(sales_collection.find({}, {"_id": 0}))
            
            if not data:
                return Response({"error": "No sales data found"}, status=status.HTTP_400_BAD_REQUEST)

            df = pd.DataFrame(data)

            # Normalize column names
            df.columns = [c.strip().lower() for c in df.columns]

            # Try to find month and sales columns
            month_col = next((c for c in df.columns if "month" in c or "mon" in c), None)
            sales_col = next((c for c in df.columns if "sales" in c), None)

            if not month_col or not sales_col:
                return Response({"error": "Missing month or sales column"}, status=status.HTTP_400_BAD_REQUEST)

            # Rename for Prophet
            df = df.rename(columns={month_col: "ds", sales_col: "y"})

            # Convert month column to datetime
            df["ds"] = pd.to_datetime(df["ds"], errors="coerce", infer_datetime_format=True)

            # If still NaT, try month names without year
            if df["ds"].isna().any():
                try:
                    df["ds"] = pd.to_datetime(df["ds"].astype(str) + " " + str(pd.Timestamp.today().year),
                                              errors="coerce", infer_datetime_format=True)
                except:
                    pass

            # Drop invalid rows
            df = df.dropna(subset=["ds", "y"])
            df["y"] = pd.to_numeric(df["y"], errors="coerce")
            df = df.dropna(subset=["y"])

            if len(df) < 2:
                return Response({"error": "Not enough valid data for forecasting"}, status=status.HTTP_400_BAD_REQUEST)

            # Train Prophet model
            model = Prophet()
            model.fit(df)

            # Forecast for 6 months ahead
            future = model.make_future_dataframe(periods=6, freq="M")
            forecast = model.predict(future)

            # Format response
            forecast_df = forecast[["ds", "yhat"]].tail(6)
            result = [{"month": str(row["ds"].date()), "forecast": round(row["yhat"], 2)}
                      for _, row in forecast_df.iterrows()]

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)