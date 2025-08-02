import os,json
import pandas as pd
from datetime import timedelta
from prophet import Prophet
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .mongo_connection import sales_collection
from django.utils.dateparse import parse_date

# -------------------------------
# 1️⃣ Upload Sales Data (CSV or Excel)
# -------------------------------
@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_sales_data(request):
    try:
        # Clear old data
        sales_collection.delete_many({})

        # Read new file
        file_obj = request.FILES['file']
        file_name = file_obj.name.lower()
        ext = os.path.splitext(file_name)[1]

        if ext == ".csv":
            df = pd.read_csv(file_obj)
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_obj)
        else:
            return Response({"status": "error", "message": "Unsupported file format"}, status=400)

        # Clean & save
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce')
        df = df.dropna(subset=['date', 'units_sold'])

        records = df.to_dict(orient="records")
        if records:
            sales_collection.insert_many(records)

        return Response({"status": "success", "rows_added": len(records)})
    
    except Exception as e:
        return Response({"status": "error", "message": str(e)})

# -------------------------------
# 2️⃣ Get Sales Data for Chart
# -------------------------------
@api_view(['GET'])
def get_sales_data(request):
    try:
        data = list(sales_collection.find({}, {"_id": 0}))

        # Ensure clean output for React chart
        for item in data:
            if "date" in item:
                item["date"] = str(item["date"])
            if "units_sold" in item:
                try:
                    item["units_sold"] = float(item["units_sold"])
                except:
                    item["units_sold"] = None

        return Response(data)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)


# -------------------------------
# 3️⃣ Forecast Sales using Prophet
# -------------------------------
@api_view(['GET'])
def forecast_sales(request):
    try:
        data = list(sales_collection.find({}, {"_id": 0}))
        if not data:
            return Response([])

        df = pd.DataFrame(data)
        if "date" not in df.columns or "units_sold" not in df.columns:
            return Response([])

        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce')
        df = df.dropna(subset=['date', 'units_sold']).sort_values('date')

        if df.empty:
            return Response([])

        df_prophet = df.rename(columns={"date": "ds", "units_sold": "y"})

        model = Prophet()
        model.fit(df_prophet)

        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        result = forecast[['ds', 'yhat']].tail(30).rename(
            columns={"ds": "date", "yhat": "predicted_sales"}
        )
        result['date'] = result['date'].dt.strftime('%Y-%m-%d')
        result['predicted_sales'] = result['predicted_sales'].round(2)

        return Response(result.to_dict(orient="records"))

    except Exception as e:
        return Response({"status": "error", "message": str(e)})
@api_view(['DELETE'])
def clear_sales_data(request):
    try:
        sales_collection.delete_many({})
        return Response({"status": "success", "message": "All sales data cleared"})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# @api_view(['GET'])
# def forecast_sales_whatif(request):
#     try:
#         # Read percentage change from query params
#         price_change = float(request.GET.get("price_change", 0))  # % change
#         multiplier = 1 + (price_change / 100)

#         # Get existing sales data
#         data = list(sales_collection.find({}, {"_id": 0}))
#         if not data:
#             return Response([])

#         df = pd.DataFrame(data)
#         if "date" not in df.columns or "units_sold" not in df.columns:
#             return Response([])

#         df['date'] = pd.to_datetime(df['date'], errors='coerce')
#         df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce')
#         df = df.dropna(subset=['date', 'units_sold']).sort_values('date')

#         if df.empty:
#             return Response([])

#         # Apply price effect — this is where your simulation logic goes
#         df['units_sold'] = df['units_sold'] * multiplier

#         # Prophet model
#         df_prophet = df.rename(columns={"date": "ds", "units_sold": "y"})
#         model = Prophet()
#         model.fit(df_prophet)

#         future = model.make_future_dataframe(periods=30)
#         forecast = model.predict(future)

#         result = forecast[['ds', 'yhat']].tail(30).rename(
#             columns={"ds": "date", "yhat": "predicted_sales"}
#         )
#         result['date'] = result['date'].dt.strftime('%Y-%m-%d')
#         result['predicted_sales'] = result['predicted_sales'].round(2)

#         return Response(result.to_dict(orient="records"))

#     except Exception as e:
#         return Response({"status": "error", "message": str(e)})
@api_view(['GET'])
def get_simulation_factors(request):
    try:
        config_path = os.path.join(os.path.dirname(__file__), "simulation_rules.json")
        with open(config_path, "r") as f:
            rules = json.load(f)
        return Response(rules)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
    
@api_view(['POST'])
def forecast_sales_simulation(request):
    try:
        # Load simulation rules
        config_path = os.path.join(os.path.dirname(__file__), "simulation_rules.json")
        with open(config_path, "r") as f:
            rules = json.load(f)

        # Get posted factors
        factors = request.data

        # Load sales data
        data = list(sales_collection.find({}, {"_id": 0}))
        if not data:
            return Response([])

        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce')
        df = df.dropna(subset=['date', 'units_sold']).sort_values('date')

        # Apply each factor's effect
        for factor, value in factors.items():
            if factor in rules:
                rule = rules[factor]
                if rule["type"] == "slider":
                    multiplier = 1 + (value / 100) * rule["effect"]
                    df['units_sold'] *= multiplier
                elif rule["type"] == "dropdown":
                    effect_value = rule["effects"].get(value, 0)
                    df['units_sold'] *= 1 + effect_value

        # Prophet forecast
        df_prophet = df.rename(columns={"date": "ds", "units_sold": "y"})
        model = Prophet()
        model.fit(df_prophet)

        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        result = forecast[['ds', 'yhat']].tail(30).rename(
            columns={"ds": "date", "yhat": "predicted_sales"}
        )
        result['date'] = result['date'].dt.strftime('%Y-%m-%d')
        result['predicted_sales'] = result['predicted_sales'].round(2)

        return Response(result.to_dict(orient="records"))

    except Exception as e:
        return Response({"status": "error", "message": str(e)})
