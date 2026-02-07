/* ============================================================
   DATABASE TYPES — Matched to live Supabase schema
   Last synced: 2026-02-07
   ============================================================ */

export type Database = {
  public: {
    Tables: {
      areas: { Row: Area; Insert: Partial<Area>; Update: Partial<Area> };
      neighborhoods: { Row: Neighborhood; Insert: Partial<Neighborhood>; Update: Partial<Neighborhood> };
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> };
      authors: { Row: Author; Insert: Partial<Author>; Update: Partial<Author> };
      business_listings: { Row: BusinessListing; Insert: Partial<BusinessListing>; Update: Partial<BusinessListing> };
      events: { Row: EventItem; Insert: Partial<EventItem>; Update: Partial<EventItem> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      cities: { Row: City; Insert: Partial<City>; Update: Partial<City> };
      stories: { Row: Story; Insert: Partial<Story>; Update: Partial<Story> };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      featured_slots: { Row: FeaturedSlot; Insert: Partial<FeaturedSlot>; Update: Partial<FeaturedSlot> };
      content_index: { Row: ContentIndex; Insert: Partial<ContentIndex>; Update: Partial<ContentIndex> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
    };
  };
};
