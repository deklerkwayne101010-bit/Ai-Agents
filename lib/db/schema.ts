import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'agent'] }).notNull().default('agent'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  campaigns: many(campaigns),
  messages: many(messages),
}));

export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  status: text('status', { enum: ['new', 'contacted', 'qualified', 'converted', 'lost'] }).notNull().default('new'),
  source: text('source'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
}));

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  price: real('price').notNull(),
  bedrooms: integer('bedrooms'),
  bathrooms: real('bathrooms'),
  sqft: integer('sqft'),
  propertyType: text('property_type', { enum: ['house', 'condo', 'townhouse', 'land', 'commercial'] }).notNull(),
  status: text('status', { enum: ['active', 'pending', 'sold', 'withdrawn'] }).notNull().default('active'),
  listingDate: integer('listing_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const propertiesRelations = relations(properties, ({ one }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
}));

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['draft', 'active', 'paused', 'completed'] }).notNull().default('draft'),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  budget: real('budget'),
  targetLeads: integer('target_leads'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  direction: text('direction', { enum: ['inbound', 'outbound'] }).notNull(),
  status: text('status', { enum: ['sent', 'delivered', 'failed'] }).notNull().default('sent'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [messages.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [messages.leadId],
    references: [leads.id],
  }),
}));

export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  metric: text('metric', { enum: ['leads_generated', 'messages_sent', 'property_views', 'campaign_engagement', 'conversions'] }).notNull(),
  value: real('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Analytic = typeof analytics.$inferSelect;
export type NewAnalytic = typeof analytics.$inferInsert;