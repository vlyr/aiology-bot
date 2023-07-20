from goose3 import Goose
import sys
import json
import re

url = sys.argv[1]
g = Goose()
article = g.extract(url=url)

print(article.title)
print("----")
print(article.meta_description)
print("----")
print(article.cleaned_text)
