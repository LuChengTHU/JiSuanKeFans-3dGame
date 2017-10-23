# -*- coding:utf-8 -*-


# from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings

def play(request):
    context = {}
    return render(request, settings.BASE_DIR+'templates/play_main.html', context)
