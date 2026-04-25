import React from "react";
import { Plus } from "lucide-react";
import { useState } from "react";

const initialForm = {
  barcode: "",
  recipient_name: "",
  address: "",
  city: "",
  section: "",
  status: "pending"
};

export default function PackageForm({ onAddPackage }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    await onAddPackage(form);
    setForm(initialForm);
  }

  return (
    <form className="package-form" onSubmit={submitForm}>
      <input name="barcode" value={form.barcode} onChange={updateField} placeholder="Barcode" required />
      <input name="recipient_name" value={form.recipient_name} onChange={updateField} placeholder="Recipient" required />
      <input name="address" value={form.address} onChange={updateField} placeholder="Address" required />
      <input name="city" value={form.city} onChange={updateField} placeholder="City" required />
      <input name="section" value={form.section} onChange={updateField} placeholder="Section" required />
      <select name="status" value={form.status} onChange={updateField}>
        <option value="pending">Pending</option>
        <option value="delivered">Delivered</option>
        <option value="not_delivered">Not delivered</option>
        <option value="redirected">Redirected</option>
      </select>
      <button className="primary-button" type="submit">
        <Plus size={17} />
        Add Package
      </button>
    </form>
  );
}
