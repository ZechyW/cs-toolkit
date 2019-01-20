from django.shortcuts import render


# Create your views here.
def index(request):
    """
    View for the main frontend page
    :param request:
    :return:
    """
    return render(request, "index.html")
