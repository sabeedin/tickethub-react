
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mvrjxindzqvowssltoyb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmp4aW5kenF2b3dzc2x0b3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzMxMjMsImV4cCI6MjA5MjM0OTEyM30.5O7kfzmbbEGTcLvQEHKsSJAEyJM5RCVICG0kTowuSqg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
