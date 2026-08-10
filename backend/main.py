
def print_trip_summary(destination, country, days, budget, currency, travel_month):

    """MENCETAK RINGKASAN RENCANA PERJALANAN KE KONSOL."""
    print   ()
    print("============================")
    print("        KELANA-AI")
    print("BY : ISHAK HALAWA")
    print("============================")
    print(f"{'destination':<13}: {destination}")
    print(f"{'country':<13}: {country}")
    print(f"{'Days':<13}: {days}")
    print(f"{'Budget':<13}: {budget:,.0f} {currency}")
    print(f"{'Currency':<13}: {currency}")
    print(f"{'Travel Month':<13}: {travel_month}")
    print ("============================")
def main():
    print ("selamat datang di KELANA-AI! isi detail perjalanan kamu yah:\n")
    destination =input("Destination      : ")
    country =input("Country              : ")
    days = int(input("Days               :  "))
    currency =input("Currency            : ")
    budget = float(input("Budget         : "))
    travel_month =input("Travel Month    : ")
    print_trip_summary(destination, country, days, budget, currency, travel_month)

if __name__ == "__main__":
    main()
    