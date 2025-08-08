# sales_api/views.py
from dateutil.relativedelta import relativedelta

import datetime
# sales_api/views.py
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .mongo_connection import sales_collection
import re,traceback
from prophet import Prophet
import numpy as np




class UploadSalesView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Detect file type and read
            if file_obj.name.endswith(".csv"):
                print("DEBUG: Trying CSV read")
                df = pd.read_csv(file_obj)
            elif file_obj.name.endswith((".xls", ".xlsx")):
                try:
                    print("DEBUG: Trying excel read")
                    df = pd.read_excel(file_obj, engine="openpyxl")
                except Exception as e:
                    return Response({"error": f"Error reading Excel file: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST)
            else:
                print("DEBUG: Trying none read")
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
            yoy_growth = None
            if len(df) > 12:
                last_year_sales = df.iloc[-13]['sales']
                if last_year_sales != 0:
                    yoy_growth = ((last_sales - last_year_sales) / last_year_sales * 100)
            kpi_summary = {
                "total_sales": round(total_sales, 2),
                "average_sales": round(avg_sales, 2),
                "best_month": best_month_row["month"],
                "best_month_sales": round(best_month_row["sales"], 2),
                "worst_month": worst_month_row["month"],
                "worst_month_sales": round(worst_month_row["sales"], 2),
                "growth_percentage": round(growth_pct, 2),
                "yoy_growth": round(yoy_growth, 2) if yoy_growth is not None else None

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
            scenario = request.data.get("scenario", "base").lower()
            growth_rate = request.data.get("growth_rate")
            price_change = request.data.get("price_change", 0)
            months = request.data.get("months", 6)
            campaigns = request.data.get("campaigns", [])

            # Get historical sales
            data = list(sales_collection.find({}, {"_id": 0}))
            if not data:
                return Response({"error": "No sales data found"}, status=status.HTTP_400_BAD_REQUEST)

            df = pd.DataFrame(data)
            df['month'] = pd.to_datetime(df['month'])
            df = df.sort_values('month')

            last_sales = df.iloc[-1]['sales']

            # Calculate base growth from historical
            if len(df) > 1:
                monthly_growth = (df['sales'].pct_change().dropna().mean())
            else:
                monthly_growth = 0.02  # default

            # Determine scenario-based params
            if scenario == "base":
                growth_rate = monthly_growth
                price_change = 0
                months = 6
            elif scenario == "best":
                growth_rate = monthly_growth + 0.15
                price_change = 0
                months = 6
            elif scenario == "worst":
                growth_rate = monthly_growth - 0.10
                price_change = 0
                months = 6
            elif scenario == "custom":
                growth_rate = float(growth_rate) if growth_rate is not None else monthly_growth
                price_change = float(price_change) if price_change is not None else 0
            else:
                return Response({"error": "Invalid scenario"}, status=status.HTTP_400_BAD_REQUEST)

            results = []
            current_sales = last_sales

            for i in range(1, months + 1):
                # Apply growth
                current_sales *= (1 + growth_rate)

                # Apply price change
                current_sales *= (1 + price_change)

                # Apply campaign lift for applicable months (custom only)
                if scenario == "custom" and campaigns:
                    for camp in campaigns:
                        start = pd.to_datetime(camp.get("start_month"))
                        end = pd.to_datetime(camp.get("end_month"))
                        lift = float(camp.get("lift", 0))
                        forecast_month = df.iloc[-1]['month'] + relativedelta(months=i)
                        if start <= forecast_month <= end:
                            current_sales *= (1 + lift)

                forecast_month = (df.iloc[-1]['month'] + relativedelta(months=i)).strftime("%Y-%m")
                results.append({"month": forecast_month, "sales": round(current_sales, 2)})

            return Response({
                "scenario": scenario,
                "summary": f"Simulation for {scenario.capitalize()} case",
                "results": results
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ForecastSalesView(APIView):
    def get(self, request):
        try:
            # Fetch data from MongoDB
            data = list(sales_collection.find({}, {"_id": 0}))
            if not data:
                return Response({
                    "historical": [],
                    "forecast": [],
                    "kpi": {},
                    "anomalies": [],
                    "trend": [],
                    "residuals": [],
                    "seasonality": [],
                    "yoy_comparison": [],
                    "moving_average": []
                }, status=status.HTTP_200_OK)

            df = pd.DataFrame(data)
            df.columns = [c.strip().lower() for c in df.columns]

            if 'month' not in df.columns or 'sales' not in df.columns:
                return Response({"error": "CSV must have 'month' and 'sales' columns"},
                                status=status.HTTP_400_BAD_REQUEST)

            df['month'] = pd.to_datetime(df['month'], errors='coerce')
            df = df.dropna(subset=['month', 'sales']).sort_values(by='month')

            # Prepare Prophet data
            prophet_df = df.rename(columns={'month': 'ds', 'sales': 'y'})
            model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
            model.fit(prophet_df)

            # Forecast future 6 months
            future = model.make_future_dataframe(periods=6, freq='M')
            forecast = model.predict(future)

            # Trend data
            trend_df = forecast[['ds', 'trend']].to_dict(orient='records')

            # Seasonality (combine yearly + weekly)
            forecast['seasonal'] = 0
            if 'yearly' in forecast.columns:
                forecast['seasonal'] += forecast['yearly']
            if 'weekly' in forecast.columns:
                forecast['seasonal'] += forecast['weekly']
            seasonality_df = forecast[['ds', 'seasonal']].to_dict(orient='records')
            forecast['residual'] = forecast['yhat'] - forecast['trend'] - forecast['seasonal']  # Add this
            residual_df = forecast[['ds', 'residual']].to_dict(orient='records')

            # Historical data
            historical_data = df.to_dict(orient='records')

            # Forecast data (with bounds)
            forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(6)
            forecast_data = forecast_data.rename(columns={
                'ds': 'month', 'yhat': 'forecast',
                'yhat_lower': 'lower_bound', 'yhat_upper': 'upper_bound'
            })
            forecast_data['month'] = forecast_data['month'].dt.strftime('%Y-%m-%d')
            forecast_list = forecast_data.to_dict(orient='records')

            # Rolling 3-month average
            df['rolling_3m_avg'] = df['sales'].rolling(window=3).mean()
            rolling_avg_list = df[['month', 'rolling_3m_avg']].dropna().to_dict(orient='records')

            # KPI calculations
            total_sales = df['sales'].sum()
            avg_sales = df['sales'].mean()
            median_sales = df['sales'].median()
            variance_sales = df['sales'].var()
            std_sales = df['sales'].std()

            best_month_row = df.loc[df['sales'].idxmax()]
            worst_month_row = df.loc[df['sales'].idxmin()]

            first_sales = df.iloc[0]['sales']
            last_sales = df.iloc[-1]['sales']
            growth_pct = ((last_sales - first_sales) / first_sales * 100) if first_sales != 0 else 0

            # Target vs Actual
            target_vs_actual = None
            if 'target' in df.columns and df['target'].sum() != 0:
                target_vs_actual = (total_sales / df['target'].sum()) * 100

            # CAC
            cac = None
            if 'customers' in df.columns and df['customers'].sum() != 0:
                cac = total_sales / df['customers'].sum()

            # Anomalies (2 std deviation rule)
            anomalies = df[(df['sales'] > avg_sales + 2 * std_sales) |
                           (df['sales'] < avg_sales - 2 * std_sales)]
            anomalies_list = anomalies[['month', 'sales']].to_dict(orient='records')
            yoy_list=[]
            if len(df) >= 12:
                for i in range(12, len(df)):
                        curr = df.iloc[i]
                        prev = df.iloc[i-12]
                        growth = None
                        if prev['sales'] != 0:
                                    growth = float((curr['sales'] - prev['sales']) / prev['sales'] * 100)
                        yoy_list.append({
                                    "month": curr['month'].strftime('%Y-%m'),
                                    "yoy_growth": growth
                        })
            else:
                first_sales = df.iloc[0]['sales']
                for i in range(1, len(df)):
                        curr = df.iloc[i]
                        growth = None
                        if first_sales != 0:
                                    growth = float((curr['sales'] - first_sales) / first_sales * 100)
                        yoy_list.append({
                                    "month": curr['month'].strftime('%Y-%m'),
                                    "yoy_growth": growth
                        })

            # KPI summary
            kpi_summary = {
                "total_sales": round(total_sales, 2),
                "average_sales": round(avg_sales, 2),
                "median_sales": round(median_sales, 2),
                "variance_sales": round(variance_sales, 2),
                "std_dev_sales": round(std_sales, 2),
                "rolling_3m_avg_last": round(df['rolling_3m_avg'].iloc[-1], 2)
                    if not df['rolling_3m_avg'].isna().all() else None,
                "best_month": best_month_row['month'].strftime('%b %Y'),
                "best_month_sales": round(best_month_row['sales'], 2),
                "worst_month": worst_month_row['month'].strftime('%b %Y'),
                "worst_month_sales": round(worst_month_row['sales'], 2),
                "growth_percentage": round(growth_pct, 2),
                "target_vs_actual_percentage": round(target_vs_actual, 2)
                    if target_vs_actual is not None else None,
                "customer_acquisition_cost": round(cac, 2) if cac is not None else None
            }
            print("YoY List:", yoy_list)

            # Final response
            return Response({
                "historical": historical_data,
                "forecast": forecast_list,
                "trend": trend_df,
                "residuals": residual_df,

                "seasonality": seasonality_df,
                "yoy_comparison": yoy_list,
                "moving_average": rolling_avg_list,
                "kpi": kpi_summary,
                "anomalies": anomalies_list
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClearSalesDataView(APIView):
    def delete(self, request):
        try:
            sales_collection.delete_many({})
            return Response({"message": "Sales data cleared successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
