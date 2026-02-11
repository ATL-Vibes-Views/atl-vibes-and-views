# REAL SUPABASE DATABASE SCHEMA — Exported Feb 11, 2026

**THIS IS THE ONLY SOURCE OF TRUTH. Do NOT use lib/types.ts as schema reference.**

---

## SECTION 1: ALL TABLES AND COLUMNS (from information_schema.columns)

```csv
table_name,column_name,data_type,is_nullable
blog_posts,id,uuid,NO
blog_posts,title,text,NO
blog_posts,slug,text,NO
blog_posts,token_name,text,YES
blog_posts,content_html,text,YES
blog_posts,content_md,text,YES
blog_posts,excerpt,text,YES
blog_posts,type,text,YES
blog_posts,pillar_id,uuid,YES
blog_posts,category_id,uuid,YES
blog_posts,neighborhood_id,uuid,YES
blog_posts,author_id,uuid,YES
blog_posts,is_sponsored,boolean,NO
blog_posts,sponsor_business_id,uuid,YES
blog_posts,featured_image_url,text,YES
blog_posts,featured_image_source,text,YES
blog_posts,featured_image_credit,text,YES
blog_posts,featured_image_notes,text,YES
blog_posts,meta_title,text,YES
blog_posts,meta_description,text,YES
blog_posts,seo_keywords,text,YES
blog_posts,canonical_url,text,YES
blog_posts,word_count,integer,YES
blog_posts,status,text,NO
blog_posts,scheduled_publish_date,timestamp with time zone,YES
blog_posts,published_at,timestamp with time zone,YES
blog_posts,content_source,text,YES
blog_posts,source_url,text,YES
blog_posts,google_doc_url,text,YES
blog_posts,tokens_used,integer,YES
blog_posts,content_index_record_id,uuid,YES
blog_posts,is_featured,boolean,NO
blog_posts,byline_override,text,YES
blog_posts,notes,text,YES
blog_posts,created_at,timestamp with time zone,NO
blog_posts,updated_at,timestamp with time zone,NO
blog_posts,content_type,text,YES
brands,id,uuid,NO
brands,brand_name,text,NO
brands,brand_logo,text,YES
brands,brand_website,text,YES
brands,created_at,timestamp with time zone,NO
brands,updated_at,timestamp with time zone,NO
business_amenities,id,uuid,NO
business_amenities,business_id,uuid,NO
business_amenities,amenity_id,uuid,NO
business_amenities,created_at,timestamp with time zone,NO
business_contacts,id,uuid,NO
business_contacts,business_id,uuid,NO
business_contacts,contact_name,text,NO
business_contacts,contact_title,text,YES
business_contacts,contact_email,text,YES
business_contacts,contact_phone,text,YES
business_contacts,is_primary,boolean,NO
business_contacts,is_public,boolean,NO
business_contacts,notes,text,YES
business_contacts,created_at,timestamp with time zone,NO
business_hours,id,uuid,NO
business_hours,business_id,uuid,NO
business_hours,day_of_week,text,NO
business_hours,open_time,time without time zone,YES
business_hours,close_time,time without time zone,YES
business_hours,is_closed,boolean,NO
business_hours,notes,text,YES
business_hours,created_at,timestamp with time zone,NO
business_identities,id,uuid,NO
business_identities,business_id,uuid,NO
business_identities,identity_option_id,uuid,NO
business_identities,created_at,timestamp with time zone,NO
business_identity_options,id,uuid,NO
business_identity_options,name,text,NO
business_identity_options,slug,text,NO
business_identity_options,sort_order,integer,NO
business_identity_options,created_at,timestamp with time zone,NO
business_images,id,uuid,NO
business_images,business_id,uuid,NO
business_images,image_url,text,NO
business_images,media_asset_id,uuid,YES
business_images,caption,text,YES
business_images,alt_text,text,YES
business_images,sort_order,integer,NO
business_images,is_primary,boolean,NO
business_images,created_at,timestamp with time zone,NO
business_listings,id,uuid,NO
business_listings,business_name,text,NO
business_listings,tagline,character varying,YES
business_listings,description,character varying,YES
business_listings,slug,text,NO
business_listings,street_address,text,NO
business_listings,street_address_2,text,YES
business_listings,state,text,NO
business_listings,zip_code,text,NO
business_listings,neighborhood_id,uuid,NO
business_listings,latitude,numeric,YES
business_listings,longitude,numeric,YES
business_listings,phone,text,YES
business_listings,email,text,YES
business_listings,website,text,YES
business_listings,primary_link,text,YES
business_listings,primary_link_label,text,YES
business_listings,instagram,text,YES
business_listings,facebook,text,YES
business_listings,tiktok,text,YES
business_listings,x_twitter,text,YES
business_listings,logo,text,YES
business_listings,video_url,text,YES
business_listings,category_id,uuid,YES
business_listings,price_range,text,YES
business_listings,display_identity_publicly,boolean,NO
business_listings,certified_diversity_program,boolean,NO
business_listings,special_offers,text,YES
business_listings,is_featured,boolean,NO
business_listings,featured_on_map,boolean,NO
business_listings,tier,text,NO
business_listings,previous_tier,text,YES
business_listings,tier_start_date,date,YES
business_listings,tier_expires_at,date,YES
business_listings,grace_period_end,date,YES
business_listings,tier_auto_downgraded,boolean,NO
business_listings,map_pin_style,text,NO
business_listings,parent_brand_id,uuid,YES
business_listings,claimed,boolean,NO
business_listings,claimed_by,uuid,YES
business_listings,claimed_at,timestamp with time zone,YES
business_listings,claim_status,text,NO
business_listings,claim_verification_method,text,YES
business_listings,status,text,NO
business_listings,created_at,timestamp with time zone,NO
business_listings,updated_at,timestamp with time zone,NO
business_listings,city_id,uuid,NO
business_listings,order_online_url,text,YES
business_organizations,id,uuid,NO
business_organizations,business_id,uuid,NO
business_organizations,organization_id,uuid,NO
business_organizations,membership_status,text,YES
business_organizations,created_at,timestamp with time zone,NO
business_tags,id,uuid,NO
business_tags,business_id,uuid,NO
business_tags,tag_id,uuid,NO
business_tags,created_at,timestamp with time zone,NO
categories,id,uuid,NO
categories,name,text,NO
categories,slug,text,NO
categories,description,text,YES
categories,applies_to,ARRAY,NO
categories,sort_order,integer,NO
categories,is_active,boolean,NO
categories,created_at,timestamp with time zone,NO
categories,updated_at,timestamp with time zone,NO
cities,id,uuid,NO
cities,name,text,NO
cities,slug,text,NO
cities,state,text,NO
cities,description,text,YES
cities,tagline,text,YES
cities,hero_image_url,text,YES
cities,logo_url,text,YES
cities,latitude,numeric,YES
cities,longitude,numeric,YES
cities,population,integer,YES
cities,metro_area,text,YES
cities,is_primary,boolean,NO
cities,is_active,boolean,NO
cities,sort_order,integer,NO
cities,created_at,timestamp with time zone,NO
cities,updated_at,timestamp with time zone,NO
claims,id,uuid,NO
claims,business_id,uuid,NO
claims,user_id,uuid,NO
claims,claim_status,text,NO
claims,verification_method,text,YES
claims,submitted_proof,text,YES
claims,reviewer_notes,text,YES
claims,reviewed_by,uuid,YES
claims,reviewed_at,timestamp with time zone,YES
claims,created_at,timestamp with time zone,NO
claims,updated_at,timestamp with time zone,NO
content_calendar,id,uuid,NO
content_calendar,story_id,uuid,YES
content_calendar,post_id,uuid,YES
content_calendar,tier,text,YES
content_calendar,scheduled_date,date,NO
content_calendar,status,text,YES
content_calendar,created_at,timestamp with time zone,YES
content_history,id,uuid,NO
content_history,story_id,uuid,NO
content_history,post_id,uuid,YES
content_history,tier,text,YES
content_history,angle_summary,text,YES
content_history,category_id,uuid,YES
content_history,neighborhood_id,uuid,YES
content_history,published_at,timestamp with time zone,YES
content_history,created_at,timestamp with time zone,YES
content_index,id,uuid,NO
content_index,token_name,text,NO
content_index,target_type,text,NO
content_index,target_id,uuid,YES
content_index,active_url,text,YES
content_index,anchor_suggestions,jsonb,YES
content_index,is_active,boolean,NO
content_index,created_at,timestamp with time zone,NO
content_index,updated_at,timestamp with time zone,NO
content_index,page_title,text,YES
content_index,page_intro,text,YES
content_index,page_body,text,YES
content_index,hero_image_url,text,YES
content_index,hero_video_url,text,YES
content_index,seo_title,text,YES
content_index,meta_description,text,YES
content_performance,id,uuid,NO
content_performance,post_id,uuid,NO
content_performance,page_views,integer,YES
content_performance,unique_visitors,integer,YES
content_performance,shares,integer,YES
content_performance,clicks,integer,YES
content_performance,avg_time_on_page,integer,YES
content_performance,bounce_rate,numeric,YES
content_performance,newsletter_opens,integer,YES
content_performance,newsletter_clicks,integer,YES
content_performance,measured_at,timestamp with time zone,YES
content_performance,created_at,timestamp with time zone,YES
event_images,id,uuid,NO
event_images,event_id,uuid,NO
event_images,image_url,text,NO
event_images,media_asset_id,uuid,YES
event_images,caption,text,YES
event_images,alt_text,text,YES
event_images,sort_order,integer,NO
event_images,is_primary,boolean,NO
event_images,created_at,timestamp with time zone,NO
event_map_pin_rules,id,uuid,NO
event_map_pin_rules,tier,text,NO
event_map_pin_rules,pin_style,text,NO
event_map_pin_rules,pin_color,text,YES
event_map_pin_rules,clickable,boolean,NO
event_map_pin_rules,shows_preview,boolean,NO
event_map_pin_rules,shows_photo,boolean,NO
event_map_pin_rules,notes,text,YES
event_map_pin_rules,created_at,timestamp with time zone,NO
event_tags,id,uuid,NO
event_tags,event_id,uuid,NO
event_tags,tag_id,uuid,NO
event_tags,created_at,timestamp with time zone,NO
event_tier_pricing,id,uuid,NO
event_tier_pricing,tier,text,NO
event_tier_pricing,default_price_cents,integer,NO
event_tier_pricing,currency,text,NO
event_tier_pricing,is_active,boolean,NO
event_tier_pricing,created_at,timestamp with time zone,NO
event_tier_pricing,updated_at,timestamp with time zone,NO
event_tier_visibility_rules,id,uuid,NO
event_tier_visibility_rules,tier,text,NO
event_tier_visibility_rules,field_name,text,NO
event_tier_visibility_rules,visible,boolean,NO
event_tier_visibility_rules,notes,text,YES
event_tier_visibility_rules,created_at,timestamp with time zone,NO
event_tier_visibility_rules,max_items,integer,YES
events,id,uuid,NO
events,title,text,NO
events,slug,text,NO
events,tagline,character varying,YES
events,description,character varying,YES
events,event_type,text,YES
events,start_date,date,NO
events,start_time,time without time zone,YES
events,end_date,date,YES
events,end_time,time without time zone,YES
events,is_recurring,boolean,NO
events,recurrence_rule,text,YES
events,venue_name,text,YES
events,street_address,text,YES
events,street_address_2,text,YES
events,state,text,YES
events,zip_code,text,YES
events,neighborhood_id,uuid,YES
events,latitude,numeric,YES
events,longitude,numeric,YES
events,organizer_name,text,YES
events,organizer_url,text,YES
events,ticket_url,text,YES
events,ticket_price_min,numeric,YES
events,ticket_price_max,numeric,YES
events,is_free,boolean,NO
events,category_id,uuid,YES
events,pillar_id,uuid,YES
events,featured_image_url,text,YES
events,website,text,YES
events,is_featured,boolean,NO
events,featured_on_map,boolean,NO
events,tier,text,NO
events,submitted_by,uuid,YES
events,status,text,NO
events,created_at,timestamp with time zone,NO
events,updated_at,timestamp with time zone,NO
events,venue_business_id,uuid,YES
events,organizer_business_id,uuid,YES
events,listing_price_cents,integer,YES
events,price_override_cents,integer,YES
events,pricing_source,text,YES
events,is_comped,boolean,NO
events,payment_status,text,NO
events,stripe_payment_intent_id,text,YES
events,featured_until,timestamp with time zone,YES
events,city_id,uuid,NO
featured_slots,id,uuid,NO
featured_slots,placement_key,text,NO
featured_slots,entity_type,text,NO
featured_slots,entity_id,uuid,NO
featured_slots,label,text,YES
featured_slots,start_date,date,YES
featured_slots,end_date,date,YES
featured_slots,sort_order,integer,NO
featured_slots,is_active,boolean,NO
featured_slots,created_by,uuid,YES
featured_slots,created_at,timestamp with time zone,NO
featured_slots,updated_at,timestamp with time zone,NO
headline_variants,id,uuid,NO
headline_variants,post_id,uuid,NO
headline_variants,variant_number,integer,YES
headline_variants,headline_text,text,NO
headline_variants,is_selected,boolean,YES
headline_variants,performance_score,integer,YES
headline_variants,created_at,timestamp with time zone,YES
map_pin_rules,id,uuid,NO
map_pin_rules,tier,text,NO
map_pin_rules,pin_style,text,NO
map_pin_rules,pin_color,text,YES
map_pin_rules,clickable,boolean,NO
map_pin_rules,shows_preview,boolean,NO
map_pin_rules,shows_photo,boolean,NO
map_pin_rules,notes,text,YES
map_pin_rules,created_at,timestamp with time zone,NO
media_assets,id,uuid,NO
media_assets,file_url,text,NO
media_assets,file_name,text,NO
media_assets,file_type,text,NO
media_assets,mime_type,text,YES
media_assets,file_size,integer,YES
media_assets,width,integer,YES
media_assets,height,integer,YES
media_assets,duration_seconds,integer,YES
media_assets,alt_text,text,YES
media_assets,caption,text,YES
media_assets,source,text,YES
media_assets,credit,text,YES
media_assets,tags,jsonb,YES
media_assets,uploaded_by,uuid,YES
media_assets,folder,text,YES
media_assets,is_active,boolean,NO
media_assets,created_at,timestamp with time zone,NO
media_assets,updated_at,timestamp with time zone,NO
media_item_assets,id,uuid,NO
media_item_assets,media_item_id,uuid,NO
media_item_assets,asset_id,uuid,NO
media_item_assets,role,text,NO
media_item_assets,is_primary,boolean,NO
media_item_assets,sort_order,integer,NO
media_item_assets,created_at,timestamp with time zone,NO
media_item_assets,updated_at,timestamp with time zone,NO
media_item_links,id,uuid,NO
media_item_links,media_item_id,uuid,NO
media_item_links,target_type,text,NO
media_item_links,target_id,uuid,NO
media_item_links,is_primary_for_target,boolean,NO
media_item_links,sort_order,integer,NO
media_item_links,created_at,timestamp with time zone,NO
media_item_links,updated_at,timestamp with time zone,NO
media_items,id,uuid,NO
media_items,title,text,NO
media_items,slug,text,NO
media_items,excerpt,text,YES
media_items,description,text,YES
media_items,media_type,text,NO
media_items,source_type,text,NO
media_items,embed_url,text,YES
media_items,status,text,NO
media_items,published_at,timestamp with time zone,YES
media_items,is_featured,boolean,NO
media_items,sort_order,integer,NO
media_items,is_active,boolean,NO
media_items,seo_title,text,YES
media_items,meta_description,text,YES
media_items,created_at,timestamp with time zone,NO
media_items,updated_at,timestamp with time zone,NO
neighborhoods,id,uuid,NO
neighborhoods,name,text,NO
neighborhoods,slug,text,NO
neighborhoods,area_id,uuid,NO
neighborhoods,description,text,YES
neighborhoods,tagline,text,YES
neighborhoods,hero_image_url,text,YES
neighborhoods,map_center_lat,numeric,YES
neighborhoods,map_center_lng,numeric,YES
neighborhoods,geojson_key,text,YES
neighborhoods,is_featured,boolean,NO
neighborhoods,is_active,boolean,NO
neighborhoods,sort_order,integer,NO
neighborhoods,created_at,timestamp with time zone,NO
neighborhoods,updated_at,timestamp with time zone,NO
newsletter_posts,id,uuid,NO
newsletter_posts,newsletter_id,uuid,NO
newsletter_posts,post_id,uuid,NO
newsletter_posts,section_id,uuid,YES
newsletter_posts,position,integer,NO
newsletter_posts,created_at,timestamp with time zone,NO
newsletter_sections,id,uuid,NO
newsletter_sections,newsletter_id,uuid,NO
newsletter_sections,section_name,text,NO
newsletter_sections,section_blurb,text,YES
newsletter_sections,section_image_url,text,YES
newsletter_sections,sort_order,integer,NO
newsletter_sections,created_at,timestamp with time zone,NO
newsletter_types,id,uuid,NO
newsletter_types,name,text,NO
newsletter_types,slug,text,NO
newsletter_types,frequency,text,NO
newsletter_types,send_day,text,YES
newsletter_types,description,text,YES
newsletter_types,is_active,boolean,NO
newsletter_types,created_at,timestamp with time zone,NO
newsletters,id,uuid,NO
newsletters,name,text,NO
newsletters,slug,text,NO
newsletters,issue_date,date,NO
newsletters,issue_slug,text,NO
newsletters,subject_line,character varying,NO
newsletters,preview_text,character varying,YES
newsletters,editor_intro,character varying,YES
newsletters,html_body,text,YES
newsletters,send_provider,text,YES
newsletters,hubspot_email_id,text,YES
newsletters,hubspot_stats_json,jsonb,YES
newsletters,sponsor_business_id,uuid,YES
newsletters,ad_snapshot,jsonb,YES
newsletters,status,text,NO
newsletters,is_public,boolean,YES
newsletters,open_rate,numeric,YES
newsletters,click_rate,numeric,YES
newsletters,send_count,integer,YES
newsletters,google_doc_url,text,YES
newsletters,notes,text,YES
newsletters,created_at,timestamp with time zone,NO
newsletters,updated_at,timestamp with time zone,NO
newsletters,newsletter_type_id,uuid,NO
organizations,id,uuid,NO
organizations,name,text,NO
organizations,slug,text,NO
organizations,website,text,YES
organizations,description,text,YES
organizations,created_at,timestamp with time zone,NO
pillars,id,uuid,NO
pillars,name,text,NO
pillars,slug,text,NO
pillars,description,text,YES
pillars,sort_order,integer,NO
pillars,is_active,boolean,NO
pillars,created_at,timestamp with time zone,NO
pillars,updated_at,timestamp with time zone,NO
post_businesses,id,uuid,NO
post_businesses,post_id,uuid,NO
post_businesses,business_id,uuid,NO
post_businesses,mention_type,text,YES
post_businesses,created_at,timestamp with time zone,NO
post_categories,id,uuid,NO
post_categories,post_id,uuid,NO
post_categories,category_id,uuid,NO
post_categories,is_primary,boolean,NO
post_categories,created_at,timestamp with time zone,NO
post_events,id,uuid,NO
post_events,post_id,uuid,NO
post_events,event_id,uuid,NO
post_events,mention_type,text,YES
post_events,created_at,timestamp with time zone,NO
post_images,id,uuid,NO
post_images,post_id,uuid,NO
post_images,image_url,text,NO
post_images,media_asset_id,uuid,YES
post_images,caption,text,YES
post_images,alt_text,text,YES
post_images,credit,text,YES
post_images,image_role,text,YES
post_images,sort_order,integer,NO
post_images,created_at,timestamp with time zone,NO
post_neighborhoods,id,uuid,NO
post_neighborhoods,post_id,uuid,NO
post_neighborhoods,neighborhood_id,uuid,NO
post_neighborhoods,is_primary,boolean,NO
post_neighborhoods,created_at,timestamp with time zone,NO
post_source_stories,id,uuid,NO
post_source_stories,post_id,uuid,NO
post_source_stories,story_id,uuid,NO
post_source_stories,created_at,timestamp with time zone,NO
post_sponsors,id,uuid,NO
post_sponsors,post_id,uuid,NO
post_sponsors,sponsor_id,uuid,NO
post_sponsors,tier,text,YES
post_sponsors,published_at,timestamp with time zone,YES
post_sponsors,created_at,timestamp with time zone,YES
post_tags,id,uuid,NO
post_tags,post_id,uuid,NO
post_tags,tag_id,uuid,NO
post_tags,created_at,timestamp with time zone,NO
redirects,id,uuid,NO
redirects,from_path,text,NO
redirects,to_path,text,NO
redirects,status_code,integer,NO
redirects,is_active,boolean,NO
redirects,hit_count,integer,NO
redirects,notes,text,YES
redirects,created_at,timestamp with time zone,NO
reviews,id,uuid,NO
reviews,business_id,uuid,NO
reviews,user_id,uuid,NO
reviews,rating,integer,NO
reviews,title,text,YES
reviews,body,character varying,YES
reviews,visit_date,date,YES
reviews,photos,jsonb,YES
reviews,status,text,NO
reviews,moderation_notes,text,YES
reviews,moderated_by,uuid,YES
reviews,moderated_at,timestamp with time zone,YES
reviews,rejection_reason,text,YES
reviews,is_verified_visit,boolean,NO
reviews,helpful_count,integer,NO
reviews,reported_count,integer,NO
reviews,auto_flagged,boolean,NO
reviews,published_at,timestamp with time zone,YES
reviews,created_at,timestamp with time zone,NO
reviews,updated_at,timestamp with time zone,NO
saved_items,id,uuid,NO
saved_items,user_id,uuid,NO
saved_items,entity_type,text,NO
saved_items,entity_id,uuid,NO
saved_items,created_at,timestamp with time zone,NO
script_batches,id,uuid,NO
script_batches,week_of,date,NO
script_batches,batch_name,text,YES
script_batches,status,text,NO
script_batches,notes,text,YES
script_batches,created_at,timestamp with time zone,NO
script_batches,updated_at,timestamp with time zone,NO
scripts,id,uuid,NO
scripts,script_batch_id,uuid,YES
scripts,story_id,uuid,YES
scripts,title,text,NO
scripts,script_text,text,YES
scripts,platform,text,YES
scripts,format,text,YES
scripts,pillar_id,uuid,YES
scripts,neighborhood_id,uuid,YES
scripts,hashtags,text,YES
scripts,call_to_action,text,YES
scripts,status,text,NO
scripts,scheduled_date,date,YES
scripts,posted_at,timestamp with time zone,YES
scripts,post_url,text,YES
scripts,created_at,timestamp with time zone,NO
scripts,updated_at,timestamp with time zone,NO
seo_content_calendar,id,uuid,NO
seo_content_calendar,title_idea,text,NO
seo_content_calendar,token_name,text,YES
seo_content_calendar,type,text,YES
seo_content_calendar,category_id,uuid,YES
seo_content_calendar,pillar_id,uuid,YES
seo_content_calendar,neighborhood_id,uuid,YES
seo_content_calendar,target_keywords,text,YES
seo_content_calendar,seasonality,text,YES
seo_content_calendar,best_publish_months,jsonb,YES
seo_content_calendar,status,text,NO
seo_content_calendar,post_id,uuid,YES
seo_content_calendar,content_index_id,uuid,YES
seo_content_calendar,notes,text,YES
seo_content_calendar,created_at,timestamp with time zone,NO
seo_content_calendar,updated_at,timestamp with time zone,NO
sponsors,id,uuid,NO
sponsors,business_id,uuid,YES
sponsors,sponsor_name,text,NO
sponsors,contact_name,text,YES
sponsors,contact_email,text,YES
sponsors,contact_phone,text,YES
sponsors,campaign_name,text,YES
sponsors,campaign_start,date,YES
sponsors,campaign_end,date,YES
sponsors,campaign_value,numeric,YES
sponsors,placement,jsonb,YES
sponsors,talking_points,text,YES
sponsors,content_index_id,uuid,YES
sponsors,status,text,NO
sponsors,notes,text,YES
sponsors,created_at,timestamp with time zone,NO
sponsors,updated_at,timestamp with time zone,NO
sponsors,package_type,text,YES
sponsors,placements_total,integer,YES
sponsors,placements_used,integer,YES
sponsors,category_focus,uuid,YES
sponsors,neighborhood_focus,uuid,YES
sponsors,is_active,boolean,YES
stories,id,uuid,NO
stories,headline,text,NO
stories,source_url,text,YES
stories,source_name,text,YES
stories,summary,text,YES
stories,pillar_id,uuid,YES
stories,city_id,uuid,YES
stories,category_id,uuid,YES
stories,priority,text,NO
stories,image_url,text,YES
stories,eligible_for_blog,boolean,NO
stories,eligible_for_script,boolean,NO
stories,assigned_blog,boolean,NO
stories,assigned_script,boolean,NO
stories,used_in_blog,boolean,NO
stories,used_in_script,boolean,NO
stories,used_in_blog_at,timestamp with time zone,YES
stories,used_in_script_at,timestamp with time zone,YES
stories,status,text,NO
stories,published_at,timestamp with time zone,YES
stories,ingested_at,timestamp with time zone,NO
stories,created_at,timestamp with time zone,NO
stories,updated_at,timestamp with time zone,NO
stories,score,integer,YES
stories,tier,text,YES
stories,neighborhood_id,uuid,YES
stories,angle_summary,text,YES
stories,expires_at,timestamp with time zone,YES
stories,banked_at,timestamp with time zone,YES
stories,reuse_eligible_at,timestamp with time zone,YES
story_businesses,id,uuid,NO
story_businesses,story_id,uuid,NO
story_businesses,business_id,uuid,NO
story_businesses,created_at,timestamp with time zone,YES
story_neighborhoods,id,uuid,NO
story_neighborhoods,story_id,uuid,NO
story_neighborhoods,neighborhood_id,uuid,NO
story_neighborhoods,created_at,timestamp with time zone,NO
story_neighborhoods,is_primary,boolean,YES
submissions,id,uuid,NO
submissions,submission_type,text,NO
submissions,submitted_by,uuid,YES
submissions,submitter_name,text,NO
submissions,submitter_email,text,NO
submissions,submitter_phone,text,YES
submissions,data,jsonb,NO
submissions,status,text,NO
submissions,reviewer_notes,text,YES
submissions,reviewed_by,uuid,YES
submissions,reviewed_at,timestamp with time zone,YES
submissions,rejection_reason,text,YES
submissions,created_record_id,uuid,YES
submissions,created_at,timestamp with time zone,NO
submissions,updated_at,timestamp with time zone,NO
subscriptions,id,uuid,NO
subscriptions,business_id,uuid,NO
subscriptions,user_id,uuid,NO
subscriptions,stripe_customer_id,text,YES
subscriptions,stripe_subscription_id,text,YES
subscriptions,plan,text,NO
subscriptions,price_monthly,numeric,YES
subscriptions,billing_cycle,text,YES
subscriptions,status,text,NO
subscriptions,current_period_start,date,YES
subscriptions,current_period_end,date,YES
subscriptions,cancel_at_period_end,boolean,NO
subscriptions,canceled_at,timestamp with time zone,YES
subscriptions,trial_start,date,YES
subscriptions,trial_end,date,YES
subscriptions,grace_period_days,integer,YES
subscriptions,downgrade_scheduled_at,timestamp with time zone,YES
subscriptions,created_at,timestamp with time zone,NO
subscriptions,updated_at,timestamp with time zone,NO
tags,id,uuid,NO
tags,name,text,NO
tags,slug,text,NO
tags,description,text,YES
tags,created_at,timestamp with time zone,NO
tags,is_active,boolean,YES
tier_changes,id,uuid,NO
tier_changes,business_id,uuid,NO
tier_changes,subscription_id,uuid,YES
tier_changes,change_type,text,NO
tier_changes,from_tier,text,NO
tier_changes,to_tier,text,NO
tier_changes,reason,text,YES
tier_changes,triggered_by,text,NO
tier_changes,admin_user_id,uuid,YES
tier_changes,notes,text,YES
tier_changes,created_at,timestamp with time zone,NO
tier_visibility_rules,id,uuid,NO
tier_visibility_rules,tier,text,NO
tier_visibility_rules,field_name,text,NO
tier_visibility_rules,visible,boolean,NO
tier_visibility_rules,notes,text,YES
tier_visibility_rules,created_at,timestamp with time zone,NO
trending_topics,id,uuid,NO
trending_topics,keyword,text,NO
trending_topics,mention_count,integer,YES
trending_topics,first_seen,timestamp with time zone,YES
trending_topics,last_seen,timestamp with time zone,YES
trending_topics,is_active,boolean,YES
trending_topics,created_at,timestamp with time zone,YES
users,id,uuid,NO
users,email,text,NO
users,display_name,text,YES
users,avatar_url,text,YES
users,role,text,NO
users,phone,text,YES
users,bio,text,YES
users,city_id,uuid,YES
users,neighborhood_id,uuid,YES
users,email_verified,boolean,NO
users,is_active,boolean,NO
users,last_login_at,timestamp with time zone,YES
users,created_at,timestamp with time zone,NO
users,updated_at,timestamp with time zone,NO
watchlist,id,uuid,NO
watchlist,project_name,text,NO
watchlist,slug,text,NO
watchlist,location,text,YES
watchlist,neighborhood_id,uuid,YES
watchlist,city_id,uuid,YES
watchlist,status,text,NO
watchlist,developer,text,YES
watchlist,project_type,jsonb,YES
watchlist,units,integer,YES
watchlist,square_feet,integer,YES
watchlist,estimated_cost,numeric,YES
watchlist,timeline,text,YES
watchlist,description,text,YES
watchlist,last_update,text,YES
watchlist,next_milestone,text,YES
watchlist,latitude,numeric,YES
watchlist,longitude,numeric,YES
watchlist,created_at,timestamp with time zone,NO
watchlist,updated_at,timestamp with time zone,NO
watchlist_posts,id,uuid,NO
watchlist_posts,watchlist_id,uuid,NO
watchlist_posts,post_id,uuid,NO
watchlist_posts,created_at,timestamp with time zone,NO
watchlist_stories,id,uuid,NO
watchlist_stories,watchlist_id,uuid,NO
watchlist_stories,story_id,uuid,NO
watchlist_stories,created_at,timestamp with time zone,NO```

---

## SECTION 2: ALL FOREIGN KEY CONSTRAINTS

```csv
table_name,column_name,foreign_table,foreign_column
ad_campaigns,sponsor_id,sponsors,id
ad_creatives,media_asset_id,media_assets,id
ad_creatives,campaign_id,ad_campaigns,id
ad_flights,creative_id,ad_creatives,id
ad_flights,campaign_id,ad_campaigns,id
ad_flights,placement_id,ad_placements,id
areas,city_id,cities,id
blog_posts,content_index_record_id,content_index,id
blog_posts,sponsor_business_id,business_listings,id
blog_posts,author_id,authors,id
blog_posts,neighborhood_id,neighborhoods,id
blog_posts,category_id,categories,id
blog_posts,pillar_id,pillars,id
business_amenities,amenity_id,amenities,id
business_amenities,business_id,business_listings,id
business_contacts,business_id,business_listings,id
business_hours,business_id,business_listings,id
business_identities,identity_option_id,business_identity_options,id
business_identities,business_id,business_listings,id
business_images,media_asset_id,media_assets,id
business_images,business_id,business_listings,id
business_listings,neighborhood_id,neighborhoods,id
business_listings,city_id,cities,id
business_listings,category_id,categories,id
business_listings,parent_brand_id,brands,id
business_listings,claimed_by,users,id
business_organizations,organization_id,organizations,id
business_organizations,business_id,business_listings,id
business_tags,tag_id,tags,id
business_tags,business_id,business_listings,id
claims,reviewed_by,users,id
claims,user_id,users,id
claims,business_id,business_listings,id
content_calendar,story_id,stories,id
content_calendar,post_id,blog_posts,id
content_history,post_id,blog_posts,id
content_history,story_id,stories,id
content_history,neighborhood_id,neighborhoods,id
content_history,category_id,categories,id
content_performance,post_id,blog_posts,id
event_images,media_asset_id,media_assets,id
event_images,event_id,events,id
event_tags,event_id,events,id
event_tags,tag_id,tags,id
events,pillar_id,pillars,id
events,submitted_by,users,id
events,category_id,categories,id
events,neighborhood_id,neighborhoods,id
events,organizer_business_id,business_listings,id
events,venue_business_id,business_listings,id
events,city_id,cities,id
featured_slots,created_by,users,id
headline_variants,post_id,blog_posts,id
media_assets,uploaded_by,users,id
media_item_assets,asset_id,media_assets,id
media_item_assets,media_item_id,media_items,id
media_item_links,media_item_id,media_items,id
neighborhoods,area_id,areas,id
newsletter_posts,newsletter_id,newsletters,id
newsletter_posts,post_id,blog_posts,id
newsletter_posts,section_id,newsletter_sections,id
newsletter_sections,newsletter_id,newsletters,id
newsletters,newsletter_type_id,newsletter_types,id
newsletters,sponsor_business_id,business_listings,id
post_businesses,post_id,blog_posts,id
post_businesses,business_id,business_listings,id
post_categories,post_id,blog_posts,id
post_categories,category_id,categories,id
post_events,post_id,blog_posts,id
post_events,event_id,events,id
post_images,post_id,blog_posts,id
post_images,media_asset_id,media_assets,id
post_neighborhoods,post_id,blog_posts,id
post_neighborhoods,neighborhood_id,neighborhoods,id
post_source_stories,post_id,blog_posts,id
post_source_stories,story_id,stories,id
post_sponsors,sponsor_id,sponsors,id
post_sponsors,post_id,blog_posts,id
post_tags,post_id,blog_posts,id
post_tags,tag_id,tags,id
reviews,user_id,users,id
reviews,moderated_by,users,id
reviews,business_id,business_listings,id
saved_items,user_id,users,id
scripts,neighborhood_id,neighborhoods,id
scripts,script_batch_id,script_batches,id
scripts,story_id,stories,id
scripts,pillar_id,pillars,id
seo_content_calendar,category_id,categories,id
seo_content_calendar,content_index_id,content_index,id
seo_content_calendar,post_id,blog_posts,id
seo_content_calendar,neighborhood_id,neighborhoods,id
seo_content_calendar,pillar_id,pillars,id
sponsors,content_index_id,content_index,id
sponsors,neighborhood_focus,neighborhoods,id
sponsors,category_focus,categories,id
sponsors,business_id,business_listings,id
stories,neighborhood_id,neighborhoods,id
stories,pillar_id,pillars,id
stories,city_id,cities,id
stories,category_id,categories,id
story_businesses,story_id,stories,id
story_businesses,business_id,business_listings,id
story_neighborhoods,neighborhood_id,neighborhoods,id
story_neighborhoods,story_id,stories,id
submissions,reviewed_by,users,id
submissions,submitted_by,users,id
subscriptions,business_id,business_listings,id
subscriptions,user_id,users,id
tier_changes,admin_user_id,users,id
tier_changes,business_id,business_listings,id
tier_changes,subscription_id,subscriptions,id
users,city_id,cities,id
users,neighborhood_id,neighborhoods,id
watchlist,city_id,cities,id
watchlist,neighborhood_id,neighborhoods,id
watchlist_posts,watchlist_id,watchlist,id
watchlist_posts,post_id,blog_posts,id
watchlist_stories,story_id,stories,id
watchlist_stories,watchlist_id,watchlist,id```

---

## SECTION 3: STATUS VALUES PER TABLE

```csv
tbl,status,count
blog_posts,draft,1
blog_posts,published,18
blog_posts,scheduled,1
events,active,13
events,completed,1
business_listings,active,35
media_items,published,18
newsletters,sent,1
newsletters,draft,1
stories,reviewed,1
stories,used,3
stories,new,2
stories,queued,2```
