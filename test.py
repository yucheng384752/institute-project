class AutoStr:
    def __init__(self, cls):
        self.cls = cls

    def __call__(self, *args, **kwargs):
        obj = self.cls(*args, **kwargs)

        def __str__(self_obj):
            return f"<{self.cls.__name__}: {vars(self_obj)}>"

        setattr(obj.__class__, "__str__", __str__)
        return obj

@AutoStr
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Alice", 20)
print(u)  # ➜ <User: {'name': 'Alice', 'age': 20}>
