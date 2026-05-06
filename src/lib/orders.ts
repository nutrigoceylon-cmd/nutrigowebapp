import { supabase } from './supabase'
import type {
  NutriOrder,
  NutriOrderItem,
  NutriOrderStatus,
  NutriPaymentStatus,
  DeliveryStatus,
  CreateOrderInput,
  OrderStatusHistoryEntry,
} from '../types'

const supabaseConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

const isUUID = (s: string | null | undefined): boolean =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

function generateOrderNumber(): string {
  const ts = Date.now().toString()
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return 'NUT-' + ts.slice(-4) + random
}

// ─── Demo mode (localStorage) ─────────────────────────────────────────────

function getDemoOrders(): NutriOrder[] {
  try {
    return JSON.parse(localStorage.getItem('nutrigo_orders') ?? '[]') as NutriOrder[]
  } catch {
    return []
  }
}

function persistDemoOrder(order: NutriOrder): void {
  const orders = getDemoOrders()
  const idx = orders.findIndex(o => o.id === order.id)
  if (idx >= 0) orders[idx] = order
  else orders.unshift(order)
  localStorage.setItem('nutrigo_orders', JSON.stringify(orders))
}

// ─── Row mapper (Supabase row → NutriOrder) ───────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>, items?: NutriOrderItem[]): NutriOrder {
  return {
    id: row.id,
    order_number: row.order_number ?? row.id.slice(0, 8).toUpperCase(),
    user_id: row.user_id ?? null,
    customer_name: row.customer_name ?? row.profile?.full_name ?? '',
    customer_email: row.customer_email ?? '',
    customer_phone: row.customer_phone ?? '',
    delivery_address_line: row.delivery_address_line ?? '',
    city: row.city ?? '',
    nearest_landmark: row.nearest_landmark ?? undefined,
    preferred_delivery_date: row.preferred_delivery_date ?? row.delivery_date ?? '',
    preferred_delivery_time: row.preferred_delivery_time ?? '',
    special_instructions: row.special_instructions ?? row.notes ?? undefined,
    meal_plan_id: row.meal_plan_id ?? null,
    meal_plan_name: row.meal_plan_name ?? '',
    total_amount: Number(row.total_amount),
    payment_method: row.payment_method ?? 'cash_on_delivery',
    checkout_payment_status: (row.checkout_payment_status ?? row.payment_status ?? 'pending') as NutriPaymentStatus,
    checkout_status: (row.checkout_status ?? row.status ?? 'order_received') as NutriOrderStatus,
    delivery_status: (row.delivery_status ?? 'not_assigned') as DeliveryStatus,
    admin_note: row.admin_note ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItemRow(row: Record<string, any>): NutriOrderItem {
  return {
    id: row.id,
    order_id: row.order_id,
    meal_id: row.meal_id ?? null,
    meal_name: row.meal_name ?? '',
    meal_category: row.meal_category ?? '',
    quantity: row.quantity ?? 1,
    delivery_date: row.item_date ?? undefined,
    calories: row.calories ?? undefined,
    price: row.price ?? undefined,
    created_at: row.created_at,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput
): Promise<{ order: NutriOrder | null; error: string | null }> {
  const orderNumber = generateOrderNumber()
  const now = new Date().toISOString()

  if (!supabaseConfigured()) {
    const id = crypto.randomUUID()
    const order: NutriOrder = {
      id,
      order_number: orderNumber,
      user_id: input.user_id ?? null,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      delivery_address_line: input.delivery_address_line,
      city: input.city,
      nearest_landmark: input.nearest_landmark,
      preferred_delivery_date: input.preferred_delivery_date,
      preferred_delivery_time: input.preferred_delivery_time,
      special_instructions: input.special_instructions,
      meal_plan_id: isUUID(input.meal_plan_id) ? input.meal_plan_id : null,
      meal_plan_name: input.meal_plan_name,
      total_amount: input.total_amount,
      payment_method: input.payment_method,
      checkout_payment_status: 'pending',
      checkout_status: 'order_received',
      delivery_status: 'not_assigned',
      created_at: now,
      updated_at: now,
      items: input.items.map(item => ({
        id: crypto.randomUUID(),
        order_id: id,
        meal_id: item.meal_id ?? null,
        meal_name: item.meal_name,
        meal_category: item.meal_category,
        quantity: item.quantity,
        calories: item.calories,
        price: item.price,
        created_at: now,
      })),
      status_history: [
        { id: crypto.randomUUID(), order_id: id, status: 'order_received', note: 'Order placed successfully', created_at: now },
      ],
    }
    persistDemoOrder(order)
    return { order, error: null }
  }

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.user_id ?? null,
      delivery_date: input.preferred_delivery_date,
      total_amount: input.total_amount,
      status: 'pending',
      payment_status: 'pending',
      order_number: orderNumber,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      delivery_address_line: input.delivery_address_line,
      city: input.city,
      nearest_landmark: input.nearest_landmark ?? null,
      preferred_delivery_time: input.preferred_delivery_time,
      special_instructions: input.special_instructions ?? null,
      notes: input.special_instructions ?? null,
      meal_plan_id: isUUID(input.meal_plan_id) ? input.meal_plan_id : null,
      meal_plan_name: input.meal_plan_name,
      payment_method: input.payment_method,
      checkout_status: 'order_received',
      checkout_payment_status: 'pending',
      delivery_status: 'not_assigned',
    })
    .select()
    .single()

  if (orderError || !orderRow) {
    return { order: null, error: orderError?.message ?? 'Failed to create order' }
  }

  const itemInserts = input.items.map(item => ({
    order_id: orderRow.id,
    meal_id: isUUID(item.meal_id) ? item.meal_id : null,
    quantity: item.quantity,
    meal_name: item.meal_name,
    meal_category: item.meal_category,
    calories: item.calories ?? null,
    price: item.price ?? null,
  }))

  if (itemInserts.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(itemInserts)
    if (itemsError) console.warn('Order items insert error:', itemsError.message)
  }

  await supabase.from('order_status_history').insert({
    order_id: orderRow.id,
    status: 'order_received',
    note: 'Order placed successfully',
  })

  const items: NutriOrderItem[] = input.items.map((item, i) => ({
    id: `temp-${i}`,
    order_id: orderRow.id,
    meal_id: item.meal_id ?? null,
    meal_name: item.meal_name,
    meal_category: item.meal_category,
    quantity: item.quantity,
    calories: item.calories,
    price: item.price,
    created_at: now,
  }))

  return { order: mapRow(orderRow, items), error: null }
}

export async function getOrderForTracking(
  orderNumber: string,
  contact: string
): Promise<{ order: NutriOrder | null; error: string | null }> {
  const NOT_FOUND = 'Order not found. Please check your order number and contact details.'

  if (!supabaseConfigured()) {
    const order = getDemoOrders().find(
      o =>
        o.order_number === orderNumber &&
        (o.customer_phone === contact ||
          o.customer_email.toLowerCase() === contact.toLowerCase())
    )
    return { order: order ?? null, error: order ? null : NOT_FOUND }
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) return { order: null, error: error.message }
  if (!data) return { order: null, error: NOT_FOUND }

  if (
    data.customer_phone !== contact &&
    (data.customer_email ?? '').toLowerCase() !== contact.toLowerCase()
  ) {
    return { order: null, error: NOT_FOUND }
  }

  const items = (data.order_items ?? []).map(mapItemRow)
  const history: OrderStatusHistoryEntry[] = (data.order_status_history ?? []).sort(
    (a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return { order: { ...mapRow(data, items), status_history: history }, error: null }
}

export async function getUserOrders(userId: string): Promise<NutriOrder[]> {
  if (!supabaseConfigured()) {
    return getDemoOrders().filter(o => o.user_id === userId)
  }

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => mapRow(row, (row.order_items ?? []).map(mapItemRow)))
}

export async function adminGetOrders(): Promise<NutriOrder[]> {
  if (!supabaseConfigured()) {
    return getDemoOrders()
  }

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .not('order_number', 'is', null)
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => mapRow(row, (row.order_items ?? []).map(mapItemRow)))
}

export async function adminGetOrderById(
  id: string
): Promise<{ order: NutriOrder | null; history: OrderStatusHistoryEntry[] }> {
  if (!supabaseConfigured()) {
    const order = getDemoOrders().find(o => o.id === id) ?? null
    return { order, history: order?.status_history ?? [] }
  }

  const [{ data: orderRow }, { data: historyRows }] = await Promise.all([
    supabase.from('orders').select('*, order_items(*)').eq('id', id).single(),
    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!orderRow) return { order: null, history: [] }

  const items = (orderRow.order_items ?? []).map(mapItemRow)
  const history: OrderStatusHistoryEntry[] = historyRows ?? []

  return { order: mapRow(orderRow, items), history }
}

export async function adminUpdateOrderStatus(
  id: string,
  status: NutriOrderStatus,
  note?: string
): Promise<{ error: string | null }> {
  if (!supabaseConfigured()) {
    const orders = getDemoOrders()
    const order = orders.find(o => o.id === id)
    if (order) {
      order.checkout_status = status
      order.updated_at = new Date().toISOString()
      const entry: OrderStatusHistoryEntry = {
        id: crypto.randomUUID(),
        order_id: id,
        status,
        note,
        created_at: new Date().toISOString(),
      }
      order.status_history = [entry, ...(order.status_history ?? [])]
      persistDemoOrder(order)
    }
    return { error: null }
  }

  const { error } = await supabase
    .from('orders')
    .update({ checkout_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (!error) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('order_status_history').insert({
      order_id: id,
      status,
      note: note ?? null,
      updated_by: user?.id ?? null,
    })
  }

  return { error: error?.message ?? null }
}

export async function adminUpdatePaymentStatus(
  id: string,
  status: NutriPaymentStatus
): Promise<{ error: string | null }> {
  if (!supabaseConfigured()) {
    const orders = getDemoOrders()
    const order = orders.find(o => o.id === id)
    if (order) {
      order.checkout_payment_status = status
      order.updated_at = new Date().toISOString()
      persistDemoOrder(order)
    }
    return { error: null }
  }

  const { error } = await supabase
    .from('orders')
    .update({ checkout_payment_status: status, payment_status: status === 'paid' ? 'paid' : 'pending', updated_at: new Date().toISOString() })
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function adminUpdateDeliveryStatus(
  id: string,
  status: DeliveryStatus
): Promise<{ error: string | null }> {
  if (!supabaseConfigured()) {
    const orders = getDemoOrders()
    const order = orders.find(o => o.id === id)
    if (order) {
      order.delivery_status = status
      order.updated_at = new Date().toISOString()
      persistDemoOrder(order)
    }
    return { error: null }
  }

  const { error } = await supabase
    .from('orders')
    .update({ delivery_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function adminSaveNote(
  id: string,
  note: string
): Promise<{ error: string | null }> {
  if (!supabaseConfigured()) {
    const orders = getDemoOrders()
    const order = orders.find(o => o.id === id)
    if (order) {
      order.admin_note = note
      order.updated_at = new Date().toISOString()
      persistDemoOrder(order)
    }
    return { error: null }
  }

  const { error } = await supabase
    .from('orders')
    .update({ admin_note: note, updated_at: new Date().toISOString() })
    .eq('id', id)

  return { error: error?.message ?? null }
}
