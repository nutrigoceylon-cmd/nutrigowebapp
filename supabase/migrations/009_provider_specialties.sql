-- Migration 009: Extend provider specialties used by the admin UI

alter type provider_specialty add value if not exists 'ayurvedic_doctor';
alter type provider_specialty add value if not exists 'western_doctor';
alter type provider_specialty add value if not exists 'yoga_instructor';
