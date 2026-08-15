"""Business logic untuk KelanaAI."""


def get_trip_category(budget):
    """Menentukan kategori perjalanan berdasarkan anggaran."""
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month):
    """Menentukan musim perjalanan berdasarkan bulan."""
    month = month.strip().lower()

    if month == "december":
        return "Peak Season"
    elif month == "june":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget, days):
    """Menghitung anggaran harian."""
    if days <= 0:
        return 0
    return budget / days


def get_recommended_places(destination):
    """Mengembalikan daftar tempat rekomendasi."""
    destination = destination.strip().lower()

    if destination == "japan":
        return ["Tokyo Tower", "Shibuya", "Mount Fuji"]
    elif destination == "bali":
        return ["Pantai Kuta", "Ubud Monkey Forest", "Tanah Lot"]
    else:
        return ["Pusat Kota", "Museum Lokal", "Pasar Tradisional"]

def get_all_recommendations():
    """Mengembalikan daftar semua tempat rekomendasi."""
    return{"Tokyo Tower" ,"Mount Fuji", "Shibuya"}

def get_transportations():
    """Mengembalikan daftar moda transportasi."""
    return{"Bus","Flight","Train"}