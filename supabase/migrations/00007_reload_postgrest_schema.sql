-- Force PostgREST to refresh schema cache after migration history repair
NOTIFY pgrst, 'reload schema';
