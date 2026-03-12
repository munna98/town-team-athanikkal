npx prisma migrate reset --force

Clear databases (after confirmation of connection strings).
Run npx prisma generate and npx prisma db push to apply the new schema.


$env:DATABASE_URL="postgresql://postgres.mzlwyzcxhqzdojymdvqw:tta12345@2026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"; 
npx.cmd prisma db push --force-reset; 
npx.cmd prisma db seed