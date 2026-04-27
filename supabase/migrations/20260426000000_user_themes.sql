alter table profiles
  add column theme_id   text not null default 'aurora-crimson'
    check (theme_id in (
      'aurora-crimson',
      'charcoal-periwinkle',
      'midnight-coral',
      'twilight-apricot',
      'storm-tangerine',
      'deep-sea-marigold',
      'graphite-sage',
      'ink-bronze'
    )),
  add column theme_mode text not null default 'dark'
    check (theme_mode in ('dark', 'light'));
