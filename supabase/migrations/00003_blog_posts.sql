-- ============================================
-- DuctDuctClean: Blog Posts Table
-- ============================================

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'DuctDuctClean Team',
    published_at DATE NOT NULL,
    read_time INTEGER NOT NULL,
    meta_description TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    sections JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    generated_by_ai BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- Updated_at trigger
CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
    ON blog_posts FOR SELECT
    USING (status = 'published');

-- Service role has full access (admin + cron)
CREATE POLICY "Service role full access blog_posts"
    ON blog_posts FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- Seed existing blog posts
-- ============================================

INSERT INTO blog_posts (slug, title, excerpt, category, author, published_at, read_time, meta_description, keywords, sections, generated_by_ai)
VALUES
(
    'how-often-should-you-clean-air-ducts-idaho',
    'How Often Should You Clean Your Air Ducts in Idaho?',
    'Learn why Idaho''s unique climate means your air ducts may need cleaning more often than national guidelines suggest.',
    'Air Quality',
    'DuctDuctClean Team',
    '2025-01-15',
    5,
    'Find out how often Idaho homeowners should clean their air ducts. Learn about local factors like dry climate, pollen seasons, and wildfire smoke that affect your indoor air quality.',
    ARRAY['air duct cleaning frequency', 'Idaho air duct cleaning', 'Idaho Falls HVAC maintenance', 'how often clean air ducts', 'indoor air quality Idaho'],
    '[
        {"heading": "The National Recommendation", "content": "The National Air Duct Cleaners Association (NADCA) recommends having your air ducts professionally cleaned every 3 to 5 years. However, this is a general guideline — your home''s specific conditions can shorten or lengthen that timeline significantly."},
        {"heading": "Why Idaho Homes May Need More Frequent Cleaning", "content": "Idaho''s climate presents unique challenges for indoor air quality. The dry, arid conditions in Eastern Idaho mean more airborne dust circulates through your home. Seasonal pollen from sagebrush, grasses, and trees can accumulate inside your ductwork. And during wildfire season, smoke particles can infiltrate your HVAC system and linger long after the air outside has cleared."},
        {"heading": "Signs Your Ducts Need Cleaning Now", "content": "Regardless of the timeline, certain signs indicate your ducts need immediate attention. Watch for these common indicators:", "list": ["Visible dust blowing from vents when the system runs", "Musty or stale odors coming from the vents", "Increased allergy or asthma symptoms indoors", "Dust buildup on furniture returns quickly after cleaning", "Uneven airflow between rooms", "Higher than normal energy bills"]},
        {"heading": "Situations That Call for Earlier Cleaning", "content": "Some circumstances mean you should schedule duct cleaning sooner rather than later, even if it hasn''t been three years:", "list": ["After a home renovation or remodeling project", "Moving into a new or previously owned home", "After a wildfire season with heavy smoke exposure", "If you have pets, especially those that shed heavily", "Smokers in the household", "Family members with respiratory conditions"]},
        {"heading": "The Bottom Line for Idaho Falls Homeowners", "content": "For most Idaho Falls homes, we recommend duct cleaning every 2 to 3 years — slightly more often than the national average due to our local climate conditions. Homes with pets, allergy sufferers, or recent renovations should consider annual inspections. A professional inspection can help determine exactly when your system needs attention."}
    ]'::jsonb,
    false
),
(
    'dryer-vent-fire-prevention-tips',
    'Dryer Vent Safety: How to Prevent House Fires in Your Idaho Home',
    'Clogged dryer vents cause thousands of house fires every year. Here''s how to keep your family safe with proper maintenance.',
    'Safety',
    'DuctDuctClean Team',
    '2025-02-10',
    4,
    'Prevent dryer vent fires in your Idaho home. Learn the warning signs of a clogged dryer vent, maintenance tips, and why professional cleaning is essential for safety.',
    ARRAY['dryer vent cleaning', 'dryer fire prevention', 'Idaho Falls dryer vent', 'clogged dryer vent signs', 'dryer vent safety'],
    '[
        {"heading": "A Hidden Danger in Your Home", "content": "According to the U.S. Fire Administration, clothes dryers are responsible for approximately 2,900 home fires each year, resulting in deaths, injuries, and millions of dollars in property damage. The leading cause? Failure to clean the dryer vent. Lint is highly flammable, and when it builds up in your vent line, it creates a serious fire hazard."},
        {"heading": "Warning Signs of a Clogged Dryer Vent", "content": "Your dryer often gives you warning signs before a dangerous situation develops. Pay attention to these red flags:", "list": ["Clothes take longer than one cycle to dry", "The dryer feels excessively hot to the touch", "A burning smell when the dryer is running", "The laundry room feels hotter or more humid than usual", "Lint accumulating around the dryer door seal", "The exterior vent flap doesn''t open during operation"]},
        {"heading": "Why Idaho Winters Make This Worse", "content": "During Idaho''s cold winters, your dryer works harder and runs longer cycles to dry clothes. This increased use means lint accumulates faster. Additionally, the warm, moist exhaust air hitting the cold exterior vent can create condensation, which causes lint to stick to the vent walls and harden into blockages that are difficult to remove without professional equipment."},
        {"heading": "DIY Maintenance Between Professional Cleanings", "content": "While professional cleaning is essential, there are steps you can take between service visits to reduce risk:", "list": ["Clean the lint trap before or after every load", "Inspect the exterior vent regularly for blockages", "Never run the dryer when you leave home or go to sleep", "Use rigid or semi-rigid metal duct instead of flexible foil", "Keep the area around the dryer clear of flammable items", "Don''t overload the dryer — it increases drying time and lint production"]},
        {"heading": "When to Call a Professional", "content": "The Consumer Product Safety Commission recommends annual professional dryer vent cleaning. A professional service uses specialized tools to clean the entire vent line from the dryer connection to the exterior exhaust, removing compacted lint that home cleaning can''t reach. This is especially important for homes with longer vent runs or vents that travel through walls or ceilings."}
    ]'::jsonb,
    false
),
(
    'improve-indoor-air-quality-eastern-idaho',
    '5 Ways to Improve Indoor Air Quality in Your Eastern Idaho Home',
    'Simple, practical steps every Eastern Idaho homeowner can take to breathe cleaner air and reduce allergens year-round.',
    'Health & Wellness',
    'DuctDuctClean Team',
    '2025-03-05',
    6,
    'Improve your indoor air quality in Eastern Idaho with these 5 proven tips. From duct cleaning to humidity control, learn how to create a healthier home environment.',
    ARRAY['indoor air quality', 'Eastern Idaho air quality', 'improve home air quality', 'Idaho Falls allergens', 'HVAC air quality tips'],
    '[
        {"heading": "Why Indoor Air Quality Matters", "content": "The EPA estimates that indoor air can be 2 to 5 times more polluted than outdoor air. Given that most people spend around 90% of their time indoors, the quality of the air in your home has a direct impact on your health. For Eastern Idaho residents, local factors like dry climate, seasonal pollen, agricultural dust, and wildfire smoke make indoor air quality even more important to address."},
        {"heading": "1. Schedule Professional Air Duct Cleaning", "content": "Your HVAC ductwork is the respiratory system of your home. Over time, dust, pollen, pet dander, mold spores, and other contaminants accumulate inside your ducts. Every time your system runs, these particles circulate throughout your home. Professional duct cleaning removes these pollutants at the source, providing an immediate improvement in air quality that you can feel from the first breath."},
        {"heading": "2. Upgrade Your HVAC Filters", "content": "Not all air filters are created equal. The MERV rating system measures a filter''s ability to capture particles. For most Idaho homes, a filter rated MERV 11 to 13 offers the best balance of filtration and airflow. Replace your filter every 60 to 90 days — or monthly if you have pets or during high-pollen seasons.", "list": ["MERV 1-4: Basic filtration, captures large particles only", "MERV 5-8: Better residential filtration, captures mold spores and dust", "MERV 9-12: Superior residential, captures fine dust and auto emissions", "MERV 13-16: Hospital-grade, captures bacteria and smoke particles"]},
        {"heading": "3. Control Humidity Levels", "content": "Eastern Idaho''s dry climate means indoor humidity often drops below 30% in winter, which can irritate airways and dry out skin. In summer, evaporative cooling can introduce excess moisture. Aim to maintain indoor humidity between 30% and 50%. A whole-home humidifier or dehumidifier integrated with your HVAC system provides the most consistent results."},
        {"heading": "4. Ventilate Properly", "content": "Modern homes are built to be energy-efficient, but tight construction can trap pollutants inside. Use bathroom and kitchen exhaust fans when cooking or showering. Open windows on mild days to let fresh air circulate. Consider an energy recovery ventilator (ERV) if you want fresh air without losing heating or cooling efficiency."},
        {"heading": "5. Reduce Indoor Pollutant Sources", "content": "Many common household items release volatile organic compounds (VOCs) and other pollutants. Simple changes can make a significant difference:", "list": ["Use low-VOC or zero-VOC paints and cleaning products", "Avoid burning candles or incense indoors frequently", "Remove shoes at the door to prevent tracking in outdoor pollutants", "Vacuum with a HEPA-filter vacuum at least twice a week", "Wash bedding weekly in hot water to reduce dust mites", "Keep houseplants — some species help filter indoor air naturally"]},
        {"heading": "Start With a Professional Assessment", "content": "The most effective first step is a professional assessment of your HVAC system and air quality. A qualified technician can identify specific issues in your home and recommend targeted solutions. At DuctDuctClean, we offer free inspections for Idaho Falls and surrounding communities — contact us today to schedule yours."}
    ]'::jsonb,
    false
);
