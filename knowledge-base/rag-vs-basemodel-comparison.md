# RAG vs Base Model — Comparison Results
# Session 9: Expand the Knowledge Base

## Test Setup
- **RAG System:** Amazon Bedrock Knowledge Base + amazon.nova-lite-v1:0
- **Base Model:** amazon.nova-lite-v1:0 (no retrieval, no documents)
- **Documents uploaded:** bali-travel-guide.md, tokyo-travel-guide.md, istanbul-travel-guide.md, travel-budget-tips.md

---

## Question 1: "What is the daily budget for a backpacker in Bali?"

### Base Model Answer:
"A backpacker in Bali can expect to spend around $30–$50 per day on average, covering basic accommodation, food, and transport."

### RAG Answer:
"According to the Bali travel guide, a budget/backpacker traveler in Bali should expect:
- Accommodation: $10–$25/night (guesthouse/hostel)
- Food: $10–$20/day (warungs, local restaurants)
- Transport: $5–$15/day (scooter rental $5–$8/day)
- Activities: $10–$20/day
- **Total: ~$35–$80/day**"

**SOURCE:** bali-travel-guide.md

### Verdict: ✅ RAG wins — specific numbers from document, more accurate breakdown.

---

## Question 2: "Do I need a visa to visit Istanbul?"

### Base Model Answer:
"Visa requirements for Istanbul (Turkey) vary by nationality. Many countries can get a visa on arrival or an e-visa."

### RAG Answer:
"Based on the Istanbul travel guide: An e-Visa is available for most nationalities. Apply online at evisa.gov.tr. Cost is $50–$100 depending on nationality. Valid for 180 days with multiple entry. Some nationalities can also get a visa on arrival. Always check the latest requirements before travel."

**SOURCE:** istanbul-travel-guide.md

### Verdict: ✅ RAG wins — specific website, cost, validity period from document.

---

## Question 3: "What are the best neighborhoods to stay in Tokyo?"

### Base Model Answer:
"Popular neighborhoods in Tokyo include Shinjuku, Shibuya, and Asakusa, each offering different experiences."

### RAG Answer:
"The Tokyo travel guide recommends these neighborhoods:
- **Shinjuku:** Entertainment hub, Golden Gai, free observation deck. Mid-range hotels $80–$200/night.
- **Shibuya:** Fashion and youth culture, Shibuya Crossing, Harajuku. $70–$180/night.
- **Asakusa:** Traditional area, Senso-ji Temple, rickshaw rides. $60–$150/night.
- **Akihabara:** Electronics and anime district.
- **Ginza:** Upscale shopping, $150–$400/night."

**SOURCE:** tokyo-travel-guide.md

### Verdict: ✅ RAG wins — price ranges and descriptions directly from document.

---

## Question 4: "How can I save money on accommodation while traveling?"

### Base Model Answer:
"To save money on accommodation, consider staying in hostels, booking in advance, and using comparison sites like Booking.com."

### RAG Answer:
"According to the travel budget tips guide:
- Book 2–3 months in advance for best rates
- Hostels are best for solo backpackers ($10–$25/night)
- Airbnb offers better value for groups of 3+ sharing
- Business hotels often provide better value than tourist hotels in Asia
- Walk 10 minutes away from major tourist sites and save 30–50% on accommodation"

**SOURCE:** travel-budget-tips.md

### Verdict: ✅ RAG wins — specific strategies and savings percentages from document.

---

## Question 5: "What foods must I try in Bali?"

### Base Model Answer:
"In Bali, you should try Nasi Goreng, Satay, Babi Guling, and fresh tropical fruits."

### RAG Answer:
"The Bali travel guide lists these must-try foods:
- **Nasi Goreng:** Indonesian fried rice, $1–$3 at warungs
- **Babi Guling:** Suckling pig, famous in Ubud ($5–$10)
- **Sate Lilit:** Balinese minced meat satay
- **Lawar:** Traditional Balinese mixed dish
- **Fresh Coconut:** $1–$2 everywhere"

**SOURCE:** bali-travel-guide.md

### Verdict: ✅ RAG wins — includes prices and specific descriptions from document.

---

## Summary

| Question | Base Model | RAG | Winner |
|---|---|---|---|
| Bali daily budget | Generic range | Specific breakdown by category | RAG |
| Istanbul visa | Vague | Website, cost, validity period | RAG |
| Tokyo neighborhoods | Names only | Prices + descriptions | RAG |
| Save on accommodation | Generic tips | Specific % savings, amounts | RAG |
| Bali must-try food | No prices | Prices + descriptions | RAG |

**RAG wins all 5 questions.** Key advantages:
1. **Specific prices and numbers** from actual documents
2. **Source citations** — users can verify answers
3. **Grounded in trusted content** — no hallucination
4. **More actionable** — tells you exactly what to expect
