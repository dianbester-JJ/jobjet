import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@/data/services";
import { 
  Plus, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Camera,
  DollarSign,
  Users,
  Star
} from "lucide-react";

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "Profile Views", value: "1,234", icon: Users, change: "+12%" },
    { label: "Inquiries", value: "45", icon: MessageSquare, change: "+8%" },
    { label: "Completed Jobs", value: "89", icon: Calendar, change: "+15%" },
    { label: "Earnings", value: "$12,450", icon: DollarSign, change: "+22%" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "listings", label: "My Listings", icon: Camera },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />

      <main className="container py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Provider Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your services and connect with clients
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        {activeTab === "overview" && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium text-primary">{stat.change}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-xl font-semibold text-foreground">Recent Inquiries</h2>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((inquiry) => (
                    <div
                      key={inquiry}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div>
                          <p className="font-medium text-foreground">John Doe</p>
                          <p className="text-sm text-muted-foreground">Interior painting</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-xl font-semibold text-foreground">Recent Reviews</h2>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div
                      key={review}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        "Amazing work! Very professional and timely. Would definitely recommend."
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">- Sarah M.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto max-w-md">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                Create Your First Listing
              </h3>
              <p className="mt-2 text-muted-foreground">
                Add services you offer with photos of your work to attract more clients.
              </p>
              <div className="mt-6">
                <label className="block text-left text-sm font-medium text-foreground mb-2">
                  Select Service Category
                </label>
                <select className="w-full rounded-lg border border-input bg-background py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Choose a category...</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
              No Messages Yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              When clients send you inquiries, they'll appear here.
            </p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Profile Settings</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Business Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Describe your services..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Hourly Rate ($)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="45"
                />
              </div>
              <Button>Save Changes</Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProviderDashboard;
