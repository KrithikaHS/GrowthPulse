from django.contrib import admin
from django.urls import path
from sales_api.views import (
    upload_sales_data, get_sales_data, forecast_sales, clear_sales_data, get_simulation_factors,forecast_sales_simulation
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/upload-sales/', upload_sales_data),
    path('api/sales-data/', get_sales_data),
    path('api/forecast-sales/', forecast_sales),
    path('api/clear-sales/', clear_sales_data),  # ✅ new clear endpoint
    # path('api/forecast-sales-whatif/', forecast_sales_whatif),
    path('api/simulation-factors/', get_simulation_factors),
    path('api/forecast-sales-simulation/', forecast_sales_simulation),


]
