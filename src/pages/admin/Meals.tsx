import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Meal, MealPlan, MealType } from '../../types'
import { supabase } from '../../lib/supabase'
import { Table } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { ImageUpload } from '../../components/ui/ImageUpload'

type FormState = Pick<Meal, 'name' | 'description' | 'meal_plan_id' | 'meal_type' | 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'prep_time' | 'day_of_week'> & {
  image_url: string
  ingredientsText: string
}

const defaultForm: FormState = {
  name: '',
  description: '',
  image_url: '',
  meal_plan_id: '',
  meal_type: 'breakfast',
  calories: 400,
  protein: 30,
  carbs: 40,
  fat: 15,
  fiber: 5,
  prep_time: 20,
  day_of_week: 1,
  ingredientsText: '',
}

export function AdminMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Meal | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  useEffect(() => {
    load()
    loadMealPlans()
  }, [])

  useEffect(() => {
    if (!modalOpen || editing || form.meal_plan_id || mealPlans.length === 0) return
    setForm(prev => ({ ...prev, meal_plan_id: mealPlans[0].id }))
  }, [modalOpen, editing, form.meal_plan_id, mealPlans])

  async function load() {
    const { data } = await supabase.from('meals').select('*').order('meal_plan_id').order('day_of_week')
    setMeals(data ?? [])
  }

  async function loadMealPlans() {
    const { data } = await supabase.from('meal_plans').select('*').order('name')
    setMealPlans(data ?? [])
    return data ?? []
  }

  async function openCreate() {
    setEditing(null)
    const plans = mealPlans.length > 0 ? mealPlans : await loadMealPlans()
    setForm({ ...defaultForm, meal_plan_id: plans[0]?.id ?? '' })
    setModalOpen(true)
  }

  function openEdit(meal: Meal) {
    setEditing(meal)
    setForm({
      name: meal.name,
      description: meal.description ?? '',
      meal_plan_id: meal.meal_plan_id,
      meal_type: meal.meal_type,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber ?? 0,
      prep_time: meal.prep_time ?? 0,
      day_of_week: meal.day_of_week,
      image_url: meal.image_url ?? '',
      ingredientsText: (meal.ingredients ?? []).join('\n'),
    })
    setModalOpen(true)
  }

  async function handleSave() {
    const { ingredientsText, image_url, ...rest } = form
    const ingredients = ingredientsText.split('\n').map(s => s.trim()).filter(Boolean)
    const payload = { ...rest, ingredients, image_url: image_url || null }
    if (editing) {
      await supabase.from('meals').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('meals').insert({ ...payload, allergens: [], is_active: true })
    }
    await load()
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this meal?')) {
      await supabase.from('meals').delete().eq('id', id)
      setMeals(prev => prev.filter(m => m.id !== id))
    }
  }

  const getPlanName = (id: string) => mealPlans.find(p => p.id === id)?.name ?? id

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Meals / Dishes</h1>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> Add Meal</Button>
      </div>

      <Table
        columns={[
          {
            key: 'name', label: 'Meal',
            render: m => (
              <div className="flex items-center gap-3">
                {m.image_url && <img src={m.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div>
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{m.meal_type} · Day {m.day_of_week}</p>
                  {m.ingredients?.length > 0 && (
                    <p className="text-xs text-gray-300 mt-0.5">{m.ingredients.length} ingredients</p>
                  )}
                </div>
              </div>
            ),
          },
          { key: 'meal_plan_id', label: 'Plan', render: m => <span className="text-sm text-gray-600">{getPlanName(m.meal_plan_id)}</span> },
          {
            key: 'macros', label: 'Nutrition',
            render: m => (
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>{m.calories} cal</p>
                <p>{m.protein}P · {m.carbs}C · {m.fat}F</p>
              </div>
            ),
          },
          { key: 'prep_time', label: 'Prep', render: m => <span className="text-sm text-gray-600">{m.prep_time} min</span> },
          {
            key: 'actions', label: '',
            render: m => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            ),
          },
        ]}
        data={meals}
        keyExtractor={m => m.id}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Meal' : 'Add Meal'} size="lg">
        <div className="space-y-4">
          <Input label="Meal Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <ImageUpload
            label="Meal Image"
            value={form.image_url}
            onChange={url => setForm(f => ({ ...f, image_url: url }))}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Ingredients <span className="text-gray-400 font-normal">(one per line)</span></label>
            <textarea
              value={form.ingredientsText}
              onChange={e => setForm(f => ({ ...f, ingredientsText: e.target.value }))}
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold resize-none"
              placeholder={"1 large whole-wheat tortilla\n3–4 slices lean turkey breast\n1 cup fresh baby spinach\n2 tbsp Greek yogurt dressing\nSliced cucumber or tomato"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Meal Plan"
              value={form.meal_plan_id}
              onChange={e => setForm(f => ({ ...f, meal_plan_id: e.target.value }))}
              options={mealPlans.map(p => ({ value: p.id, label: p.name }))}
            />
            <Select
              label="Meal Type"
              value={form.meal_type}
              onChange={e => setForm(f => ({ ...f, meal_type: e.target.value as MealType }))}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snack' },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Calories" type="number" value={String(form.calories)} onChange={e => setForm(f => ({ ...f, calories: Number(e.target.value) }))} />
            <Input label="Protein (g)" type="number" value={String(form.protein)} onChange={e => setForm(f => ({ ...f, protein: Number(e.target.value) }))} />
            <Input label="Carbs (g)" type="number" value={String(form.carbs)} onChange={e => setForm(f => ({ ...f, carbs: Number(e.target.value) }))} />
            <Input label="Fat (g)" type="number" value={String(form.fat)} onChange={e => setForm(f => ({ ...f, fat: Number(e.target.value) }))} />
            <Input label="Fiber (g)" type="number" value={String(form.fiber ?? 0)} onChange={e => setForm(f => ({ ...f, fiber: Number(e.target.value) }))} />
            <Input label="Prep Time (min)" type="number" value={String(form.prep_time ?? 0)} onChange={e => setForm(f => ({ ...f, prep_time: Number(e.target.value) }))} />
          </div>
          <Select
            label="Day of Week"
            value={String(form.day_of_week)}
            onChange={e => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
            options={[1,2,3,4,5,6,7].map(d => ({ value: String(d), label: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][d-1] }))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} fullWidth disabled={!form.meal_plan_id}>{editing ? 'Save Changes' : 'Add Meal'}</Button>
          </div>
          {mealPlans.length === 0 && (
            <p className="text-xs text-red-500">
              No meal plans found. Create a meal plan first, then add dishes to it.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
