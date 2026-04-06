import os
import sys

# Add the project root to the python path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.db.models import ClientAlias
from sqlalchemy import select, delete

COMPANIES = [
    "YuWaah", "CHOSEN", "TWC", "Coupang", "Alt DRX", "Musashi", "Origin Fresh", 
    "Reddit", "Demandbase", "Modi Illva", "Hasbro", "mPokket", "SenseAI", "Qure.ai", 
    "Circuit House", "Smile Group", "University of San Diego", "Edenred", "SVP", 
    "Zeno Health", "Loreal", "Milliken - Flooring", "Masin", "Fujifilm", "Scaler", 
    "Battery Smart", "Udaiti", "MetaShop AI", "University of Western Australia", 
    "College Vidya", "Asha Ventures", "Synergy Capital", "AssetPlus", "Nicobar", 
    "Suez India", "Google", "Nuuk", "Milliken", "Guardian Health", "Red Pen", 
    "Engie", "Angara Jewelry", "GNFZ", "SunSiyam", "SleepyCat", "Swiggy", 
    "Observe.ai", "Bayone", "JustJobs", "TrueBlue", "Mehta Family Foundation", 
    "Falcon FS", "v-Titan", "KisanKfraft", "Mahina", "Folk Frequency", "HiSense", 
    "vivo", "Plum", "GradRight (SUNY Buffalo)", "IBDIC", "Maybelline New York", 
    "Montra Electric", "JumpCloud", "BotLab Dynamics", "Ingram Micro", "PetG", 
    "Acquaviva", "Capgemini", "Chupps", "Clinikally", "Squadstack", "Upliance.ai", 
    "Ugaao", "iLead", "National Law School (NLS)", "Rakuten Symphony - brand", 
    "Rakuten Symphony - Crisis", "Rakuten Symphony - Prajaka Profiling", "Avaamo", 
    "Pearl Academy", "UPES", "University of Surrey (UPES IBC)", "KFC", "Enkash", 
    "Good Bug", "Snabbit", "Anand Sweets", "slice", "PayGlocal", "Blue Tokai", 
    "GoHighLevel", "D2C Insider", "Ameliya Ventures", "Weaver Finance", "Indian Oil", 
    "Chai Bisket", "Emeritus", "Eume", "Scapia", "Udhyam Learning", "Omnicom Global Solutions", 
    "2380 Capital", "Playbook Partners", "Shubhanshu Shukla", "IIMA Ventures", "AIP", 
    "Scale AKA TCF", "Pronto", "Seekho", "Healthkois", "Adda Education", "Great Learning", 
    "Illumine", "Mitigata", "AstraZeneca", "Straive", "Namma Yatri", "FRND", 
    "Sattva Consulting", "Smallest", "Kissht", "Paasa", "AxiTrust", "IHG", 
    "Inc.5 Shoes", "BCG", "Urban Degh", "Walmart Global Tech", "ComputaCenter", 
    "GPS Renewables", "Hexagon", "Astra Security", "Bright Money", "Pixxel", 
    "South Park Commons", "Windsor House", "Decentro", "SCALE", "Aurobindo Pharma", 
    "Murf AI", "Way2News", "JoshTalks", "Qualcomm", "GullyLabs", "Optimeus", 
    "Panasonic", "iTel", "Simple Energy", "Anu Rathninde", "DailyObjects", 
    "Paasa (2)", "Zeta", "Netflix", "Jar", "AVPN", "Bolna.ai", "Novo Camps", 
    "Prime Ventures", "Chalet Hotels", "Caterpillar Inc", "CSF", "Room to Read", 
    "Kaizen Analytix", "Goldi Solar", "Zappfresh", "VMS Group"
]

def seed():
    with SessionLocal() as db:
        print(f"Cleaning existing aliases...")
        db.execute(delete(ClientAlias))
        
        seen = set()
        added_count = 0
        
        for company in COMPANIES:
            name = company.strip()
            if not name or name in seen:
                continue
            
            # Create primary alias
            main_alias = name
            # Handle special cases like "Rakuten Symphony - brand"
            if " - " in name:
                main_alias = name.split(" - ")[0]
            if " (" in name:
                main_alias = name.split(" (")[0]
            
            alias_entry = ClientAlias(
                client_name=name,
                alias=main_alias,
                sector="General"
            )
            db.add(alias_entry)
            seen.add(name)
            added_count += 1
            
            # Add secondary alias if different (e.g. lowercase version for fuzzy matching)
            if main_alias.lower() != main_alias:
                db.add(ClientAlias(
                    client_name=name,
                    alias=main_alias.lower(),
                    sector="General"
                ))
        
        db.commit()
        print(f"Successfully added {added_count} companies to client_aliases table.")

if __name__ == "__main__":
    seed()
