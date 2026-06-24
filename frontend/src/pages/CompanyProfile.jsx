import { useEffect, useState } from "react";
import { FaBuilding, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export default function CompanyProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isReadOnly = user && user.role !== "Owner";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [extraInfo, setExtraInfo] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("get-company-profile.php");
      if (res.data.success) {
        const profileData =
          res.data.profile && typeof res.data.profile === "object" && !Array.isArray(res.data.profile)
            ? res.data.profile
            : {};
        setProfile(profileData);
        setCompanyName(profileData.company_name || "");
        setLogoUrl(profileData.logo_url || "");
        setAddress(profileData.address || "");
        setCountry(profileData.country || "");
        setContact(profileData.contact || "");
        setPhone(profileData.phone || "");
        setEmail(profileData.email || "");
        setWebsite(profileData.website || "");
        setTaxId(profileData.tax_id || "");
        setTaxPercentage(profileData.tax_percentage || "");
        setExtraInfo(profileData.extra_info || "");
      }
    } catch (err) {
      toast.error("Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }

    if (!country.trim()) {
      toast.error("Country is required");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required");
      return;
    }

    setSaving(true);
    try {
      const res = await API.post("save-company-profile.php", {
        company_name: companyName,
        logo_url: logoUrl,
        address,
        country,
        contact,
        phone,
        email,
        website,
        tax_id: taxId,
        tax_percentage: taxPercentage,
        extra_info: extraInfo
      });

      if (res.data.success) {
        toast.success("Company profile saved");
        setProfile({
          company_name: companyName,
          logo_url: logoUrl,
          address,
          country,
          contact,
          phone,
          email,
          website,
          tax_id: taxId,
          tax_percentage: taxPercentage,
          extra_info: extraInfo
        });
      } else {
        toast.error(res.data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Company Profile" subtitle="Add branding details for branded invoices">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Company Profile</h3>
          <p className="mt-1 text-sm text-slate-500">
            Save your company details so invoices include your logo, contact info, and tax details.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <FaSave />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>

      <PageCard title="Company Profile Details">
        {loading ? (
          <p className="py-8 text-center text-slate-400">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                  disabled={isReadOnly}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  rows={3}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Primary Contact Person</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={inputClass}
                  placeholder="Name"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Phone number"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="Website"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tax ID / GSTIN</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. GSTIN/VAT"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Default Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 18"
                  disabled={isReadOnly}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Additional Information</label>
                <textarea
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="Any extra company details to show on invoices"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </form>
        )}
      </PageCard>

      {(profile?.company_name || profile?.address || profile?.contact || profile?.email || profile?.website || profile?.tax_id) && (
        <PageCard title="Preview" className="mt-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Company Logo"
                  className="h-16 w-16 rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                  <FaBuilding className="text-lg" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{profile.company_name || "Company Name"}</h3>
                {profile.country && <p className="text-sm text-slate-600">{profile.country}</p>}
                {profile.address && <p className="mt-1 text-sm text-slate-600">{profile.address}</p>}
                {profile.contact && <p className="text-sm text-slate-600">{profile.contact}</p>}
                {profile.phone && <p className="text-sm text-slate-600">{profile.phone}</p>}
                {profile.email && <p className="text-sm text-slate-600">{profile.email}</p>}
                {profile.website && <p className="text-sm text-slate-600"><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{profile.website}</a></p>}
                {profile.tax_id && <p className="mt-1 text-xs text-slate-500">{profile.tax_id}</p>}
                {profile.tax_percentage && <p className="text-xs text-slate-500">Default Tax: {profile.tax_percentage}%</p>}
              </div>
            </div>
          </div>
        </PageCard>
      )}
    </Layout>
  );
}
