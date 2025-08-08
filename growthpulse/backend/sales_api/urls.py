# sales_api/urls.py
from django.urls import path
from .views import ClearSalesDataView, ForecastSalesView, UploadSalesView, GetSalesDataView, SimulateSalesView

urlpatterns = [
    path('upload-sales/', UploadSalesView.as_view(), name='upload-sales'),
    path('sales-data/', GetSalesDataView.as_view(), name='sales-data'),
    path('simulate-sales/', SimulateSalesView.as_view(), name='simulate-sales'),
    path('forecast-sales/', ForecastSalesView.as_view(), name='forecast-sales'),
    path("clear-sales/", ClearSalesDataView.as_view(), name="clear-sales"),

]
