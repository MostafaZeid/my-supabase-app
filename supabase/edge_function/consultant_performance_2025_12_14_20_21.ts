import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { method } = req
    const url = new URL(req.url)
    const consultantId = url.searchParams.get('consultant_id')

    if (method === 'POST') {
      // حساب إحصائيات مستشار محدد أو جميع المستشارين
      if (consultantId) {
        await calculateConsultantPerformance(supabase, consultantId)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Performance statistics updated for consultant ${consultantId}` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else {
        // حساب إحصائيات جميع المستشارين
        const { data: consultants, error } = await supabase
          .from('consultants_2025_12_14_20_21')
          .select('id')
          .eq('status', 'active')

        if (error) {
          throw error
        }

        let updatedCount = 0
        for (const consultant of consultants) {
          try {
            await calculateConsultantPerformance(supabase, consultant.id)
            updatedCount++
          } catch (err) {
            console.error(`Error updating consultant ${consultant.id}:`, err)
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Performance statistics updated for ${updatedCount} consultants` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    if (method === 'GET') {
      // جلب إحصائيات مستشار محدد
      if (!consultantId) {
        return new Response(
          JSON.stringify({ error: 'consultant_id parameter is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const { data: performance, error } = await supabase
        .from('consultant_performance_2025_12_14_20_21')
        .select('*')
        .eq('consultant_id', consultantId)
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, data: performance }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error in consultant-performance function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// دالة حساب إحصائيات الأداء للمستشار
async function calculateConsultantPerformance(supabase: any, consultantId: string) {
  try {
    // جلب بيانات المستشار
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants_2025_12_14_20_21')
      .select('*')
      .eq('id', consultantId)
      .single()

    if (consultantError) {
      throw consultantError
    }

    // حساب إحصائيات المشاريع (بيانات تجريبية - يمكن ربطها بجداول المشاريع الفعلية لاحقاً)
    const projectStats = await calculateProjectStats(supabase, consultant.email)
    
    // حساب الإحصائيات المالية
    const financialStats = await calculateFinancialStats(supabase, consultant.email)
    
    // حساب إحصائيات الجودة
    const qualityStats = await calculateQualityStats(supabase, consultant.email)

    // تحديث أو إدراج الإحصائيات
    const performanceData = {
      consultant_id: consultantId,
      total_projects: projectStats.total,
      completed_projects: projectStats.completed,
      active_projects: projectStats.active,
      success_rate: projectStats.successRate,
      total_budget_managed: financialStats.totalBudget,
      average_project_value: financialStats.averageValue,
      largest_project_value: financialStats.largestValue,
      average_client_rating: qualityStats.averageRating,
      on_time_delivery_rate: qualityStats.onTimeRate,
      client_satisfaction_rate: qualityStats.satisfactionRate,
      cost_savings_percentage: financialStats.costSavings,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // محاولة التحديث أولاً
    const { error: updateError } = await supabase
      .from('consultant_performance_2025_12_14_20_21')
      .update(performanceData)
      .eq('consultant_id', consultantId)

    // إذا فشل التحديث (لا توجد بيانات)، قم بالإدراج
    if (updateError) {
      const { error: insertError } = await supabase
        .from('consultant_performance_2025_12_14_20_21')
        .insert(performanceData)

      if (insertError) {
        throw insertError
      }
    }

    console.log(`Performance statistics updated for consultant: ${consultant.full_name}`)
    return true

  } catch (error) {
    console.error(`Error calculating performance for consultant ${consultantId}:`, error)
    throw error
  }
}

// حساب إحصائيات المشاريع
async function calculateProjectStats(supabase: any, consultantEmail: string) {
  // بيانات تجريبية - يمكن استبدالها بحسابات فعلية من جداول المشاريع
  const mockData = {
    'fahad.alsaadi@albayan.com': { total: 52, completed: 48, active: 4, successRate: 96.2 },
    'mohammed.rashad@albayan.com': { total: 48, completed: 44, active: 4, successRate: 94.8 },
    'mohammed.joudah@albayan.com': { total: 35, completed: 33, active: 2, successRate: 97.1 },
    'marwa.alhamamsi@albayan.com': { total: 28, completed: 25, active: 3, successRate: 92.9 }
  }

  return mockData[consultantEmail] || { total: 0, completed: 0, active: 0, successRate: 0 }
}

// حساب الإحصائيات المالية
async function calculateFinancialStats(supabase: any, consultantEmail: string) {
  // بيانات تجريبية - يمكن استبدالها بحسابات فعلية من جداول المشاريع والفواتير
  const mockData = {
    'fahad.alsaadi@albayan.com': { 
      totalBudget: 125000000, 
      averageValue: 2400000, 
      largestValue: 4100000, 
      costSavings: 15.2 
    },
    'mohammed.rashad@albayan.com': { 
      totalBudget: 98000000, 
      averageValue: 2040000, 
      largestValue: 3800000, 
      costSavings: 12.8 
    },
    'mohammed.joudah@albayan.com': { 
      totalBudget: 75000000, 
      averageValue: 2140000, 
      largestValue: 3200000, 
      costSavings: 18.5 
    },
    'marwa.alhamamsi@albayan.com': { 
      totalBudget: 62000000, 
      averageValue: 2210000, 
      largestValue: 3500000, 
      costSavings: 14.3 
    }
  }

  return mockData[consultantEmail] || { 
    totalBudget: 0, 
    averageValue: 0, 
    largestValue: 0, 
    costSavings: 0 
  }
}

// حساب إحصائيات الجودة
async function calculateQualityStats(supabase: any, consultantEmail: string) {
  // بيانات تجريبية - يمكن استبدالها بحسابات فعلية من تقييمات العملاء
  const mockData = {
    'fahad.alsaadi@albayan.com': { 
      averageRating: 4.7, 
      onTimeRate: 94.5, 
      satisfactionRate: 4.8 
    },
    'mohammed.rashad@albayan.com': { 
      averageRating: 4.6, 
      onTimeRate: 92.3, 
      satisfactionRate: 4.6 
    },
    'mohammed.joudah@albayan.com': { 
      averageRating: 4.8, 
      onTimeRate: 96.8, 
      satisfactionRate: 4.9 
    },
    'marwa.alhamamsi@albayan.com': { 
      averageRating: 4.5, 
      onTimeRate: 89.7, 
      satisfactionRate: 4.4 
    }
  }

  return mockData[consultantEmail] || { 
    averageRating: 0, 
    onTimeRate: 0, 
    satisfactionRate: 0 
  }
}