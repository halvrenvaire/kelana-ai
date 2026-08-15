from services.trip_service import (
    get_trip_category,
    get_travel_season,
    calculate_daily_budget,
    get_recommended_places,
)


def print_trip_summary(destination, country, days, budget, currency,
                       travel_month, category, daily_budget, season, places):
    """Mencetak ringkasan rencana perjalanan ke konsol."""
    print()
    print("==================================")
    print("            KELANA-AI")
    print("         BY : ISHAK HALAWA")
    print("==================================")
    print(f"{'Destination':<15}: {destination}")
    print(f"{'Country':<15}: {country}")
    print(f"{'Days':<15}: {days}")
    print(f"{'Budget':<15}: {budget:,.0f} {currency}")
    print(f"{'Category':<15}: {category}")
    print(f"{'Daily Budget':<15}: {daily_budget:,.0f} {currency}/Day")
    print(f"{'Travel Month':<15}: {travel_month}")
    print(f"{'Season':<15}: {season}")
    print()
    print("Recommended Places")

    for place in places:
        print(f"- {place}")

    print("==================================")


def main():
    print("Selamat datang di KELANA-AI! Isi detail perjalanan kamu:\n")

    destination = input("Destination   : ")
    country = input("Country       : ")
    days = int(input("Days          : "))
    budget = float(input("Budget        : "))
    currency = input("Currency      : ")
    travel_month = input("Travel Month  : ")

    category = get_trip_category(budget)
    season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    places = get_recommended_places(destination)

    print_trip_summary(destination, country, days, budget, currency,
                       travel_month, category, daily_budget, season, places)


if __name__ == "__main__":
    main()


