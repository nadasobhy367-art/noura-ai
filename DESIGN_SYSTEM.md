# 🏥 Noura AI - Medical Design System

## 📋 نظرة عامة

تم تحديث نظام التصميم ليعكس هوية طبية احترافية مع التركيز على الذكاء الاصطناعي والابتكار الطبي.

---

## 🎨 نظام الألوان الطبي

### الألوان الأساسية

#### 🔵 Medical Blue (الأزرق الطبي)
- **الكود**: `#0d6efd`
- **الاستخدام**: الأزرار الرئيسية، الرؤوس، الروابط
- **الدلالة**: الثقة، الاحترافية، الأمان الطبي

```css
--medical-blue: #0d6efd;
--medical-blue-light: #cfe2ff;
```

#### 🟢 Health Green (الأخضر الصحي)
- **الكود**: `#22c55e`
- **الاستخدام**: حالات النجاح، المؤشرات الإيجابية، الموافقة
- **الدلالة**: الصحة، الشفاء، الإيجابية

```css
--health-green: #22c55e;
--health-green-light: #dcfce7;
```

#### 🔴 Medical Red (الأحمر الطبي)
- **الكود**: `#dc2626`
- **الاستخدام**: التنبيهات، الأخطاء، الحالات الحرجة
- **الدلالة**: التحذير، الأهمية، الحالات الطارئة

```css
--medical-red: #dc2626;
--medical-red-light: #fee2e2;
```

#### 🔷 AI Cyan (السيان للذكاء الاصطناعي)
- **الكود**: `#22d3ee`
- **الاستخدام**: عناصر الذكاء الاصطناعي، البيانات المتحركة
- **الدلالة**: التكنولوجيا، الابتكار، المعالجة الذكية

```css
--ai-cyan: #22d3ee;
```

#### 🟣 AI Purple (البنفسجي للذكاء الاصطناعي)
- **الكود**: `#9333ea`
- **الاستخدام**: الشبكات العصبية، المعالجة المتقدمة
- **الدلالة**: الذكاء، التعقيد، الابتكار

```css
--ai-purple: #9333ea;
```

---

## 🎯 مكونات التصميم

### الأزرار

#### زر أساسي (Primary)
```jsx
<button className="btn-primary">
  إجراء أساسي
</button>
```
- **اللون**: تدرج من الأزرق الطبي إلى البنفسجي
- **الحالات**: عادي، تمرير الفأرة، نشط

#### زر النجاح (Success)
```jsx
<button className="btn-success">
  تم بنجاح
</button>
```
- **اللون**: تدرج أخضر صحي
- **الاستخدام**: تأكيد الإجراءات الناجحة

#### زر الخطر (Danger)
```jsx
<button className="btn-danger">
  حذف / إلغاء
</button>
```
- **اللون**: تدرج أحمر طبي
- **الاستخدام**: إجراءات حساسة أو حذف

### التنبيهات (Alerts)

```jsx
<div className="alert-medical info">
  ℹ️ معلومة عامة
</div>

<div className="alert-medical success">
  ✓ تم بنجاح
</div>

<div className="alert-medical warning">
  ⚠️ تحذير
</div>

<div className="alert-medical error">
  ✕ خطأ
</div>
```

### الشارات (Badges)

```jsx
<span className="badge-medical primary">نشط</span>
<span className="badge-medical success">معتمد</span>
<span className="badge-medical danger">حرج</span>
```

### مؤشرات الحالة (Status Indicators)

```jsx
<div className="status-indicator active">
  <span>نشط</span>
</div>

<div className="status-indicator warning">
  <span>قيد الانتظار</span>
</div>

<div className="status-indicator inactive">
  <span>غير نشط</span>
</div>
```

### الجداول الطبية

```jsx
<table className="table-medical">
  <thead>
    <tr>
      <th>معرف المريض</th>
      <th>الحالة</th>
      <th>التاريخ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>P-001</td>
      <td><span className="status-indicator active">نشط</span></td>
      <td>2024-01-15</td>
    </tr>
  </tbody>
</table>
```

---

## ✨ الرسوميات المتحركة

### Pulse Medical (نبض طبي)
```css
animation: pulse-medical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```
- **الاستخدام**: مؤشرات النشاط، الحالات الحية

### Heartbeat (نبضات القلب)
```css
animation: heartbeat 1.2s ease-in-out infinite;
```
- **الاستخدام**: عناصر حساسة، مراقبة حيوية

### Glow Medical (توهج طبي)
```css
animation: glow-medical 2s ease-in-out infinite;
```
- **الاستخدام**: بطاقات مهمة، عناصر بارزة

---

## 🎨 استخدام Tailwind CSS

### الألوان المخصصة

```jsx
// Medical Blue
<div className="bg-medical-500 text-medical-900">
  محتوى طبي
</div>

// Health Green
<div className="bg-health-500 text-health-900">
  حالة صحية
</div>

// Alert Red
<div className="bg-alert-500 text-alert-900">
  تنبيه
</div>
```

### التدرجات

```jsx
// Medical Gradient
<div className="bg-medical-gradient">
  تدرج طبي
</div>

// Health Gradient
<div className="bg-health-gradient">
  تدرج صحي
</div>
```

### الظلال

```jsx
// Medical Shadow
<div className="shadow-medical">
  ظل طبي
</div>

// Medical Large Shadow
<div className="shadow-medical-lg">
  ظل طبي كبير
</div>
```

---

## 🎯 اللوجو المحسّن

### العناصر الجديدة

1. **شبكة عصبية (Neural Network)**
   - تمثل الذكاء الاصطناعي
   - عقد متصلة بخطوط بيانات متحركة
   - ألوان: أزرق طبي، سيان، بنفسجي

2. **نبضات القلب (Heartbeat)**
   - موجة ECG متحركة
   - نبضات حمراء طبية
   - تمثل المراقبة الحيوية

3. **موجات صوتية (Sound Waves)**
   - تمثل الفحوصات الطبية
   - حركة دائرية متوسعة
   - لون أخضر صحي

4. **صليب طبي (Medical Cross)**
   - رمز طبي كلاسيكي
   - شفاف وخفيف
   - لون أحمر طبي

---

## 📱 التجاوب (Responsive Design)

جميع المكونات تتجاوب مع الأجهزة المختلفة:

```css
@media (max-width: 768px) {
  /* تعديلات للأجهزة الصغيرة */
}
```

---

## 🌙 الوضع الليلي (Dark Mode)

جميع الألوان لها نسخة مظلمة:

```css
.dark {
  --medical-blue: #60a5fa;
  --health-green: #4ade80;
  --medical-red: #f87171;
}
```

---

## 📚 أمثلة الاستخدام

### بطاقة طبية كاملة

```jsx
<div className="hover-card">
  <div className="card-header-medical">
    تقرير المريض
  </div>
  <div className="p-6">
    <div className="status-indicator active">
      نشط
    </div>
    <p className="text-medical-600 mt-4">
      معرف المريض: P-001
    </p>
    <button className="btn-primary mt-4">
      عرض التفاصيل
    </button>
  </div>
</div>
```

### نموذج إدخال طبي

```jsx
<input
  type="text"
  className="input-medical"
  placeholder="أدخل معرف المريض"
/>
```

---

## 🔧 التخصيص

يمكن تخصيص الألوان من خلال:

1. **متغيرات CSS**: في `:root` في `index.css`
2. **Tailwind Config**: في `tailwind.config.js`
3. **App.css**: للأنماط المخصصة

---

## ✅ قائمة التحقق

- [x] ألوان طبية أساسية
- [x] مكونات زر محسّنة
- [x] تنبيهات وشارات
- [x] مؤشرات حالة
- [x] جداول طبية
- [x] رسوميات متحركة
- [x] لوجو محسّن مع عناصر AI
- [x] دعم الوضع الليلي
- [x] تجاوب كامل

---

## 📞 الدعم

للأسئلة أو الاقتراحات حول نظام التصميم، يرجى التواصل مع فريق التط��ير.
