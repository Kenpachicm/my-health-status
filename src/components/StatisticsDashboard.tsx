import { useState, useEffect } from 'react';
import { FileText, Users, ClipboardCheck, Calendar, TrendingUp, Menu, Info, ExternalLink, MapPin } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StatsCard from './stats/StatsCard';
import FilterSidebar from './stats/FilterSidebar';

interface NationalStats {
  total_cases: number;
  year_over_year_change: number;
  testing_rate: number;
  lifetime_risk: number;
  youth_percentage: number;
  last_updated: string;
  data_source: string;
}

interface STITypeData {
  sti_type: string;
  total_cases: number;
  year_over_year_change: number;
  severity_level: string;
}

export default function StatisticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');
  const [nationalStats, setNationalStats] = useState<NationalStats | null>(null);
  const [stiTypeData, setSTITypeData] = useState<STITypeData[]>([]);
  const [demographicsAge, setDemographicsAge] = useState<any[]>([]);
  const [demographicsGender, setDemographicsGender] = useState<any[]>([]);
  const [geographicData, setGeographicData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    year: 2024,
    stiType: ['All'],
    ageGroups: ['15-19', '20-24', '25-29', '30-39', '40+'],
    genders: ['All'],
    regions: ['All'],
  });

  useEffect(() => {
    loadData();
  }, [filters.year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const nationalSnap = await getDocs(query(collection(db, 'sti_national_stats'), where('year', '==', filters.year), limit(1)));
      const national = nationalSnap.empty ? null : nationalSnap.docs[0].data();

      const typesSnap = await getDocs(query(collection(db, 'sti_by_type'), where('year', '==', filters.year), orderBy('total_cases', 'desc')));
      const types = typesSnap.docs.map(d => ({ id: d.id, ...d.data() }) as STITypeData);

      const demoAgeSnap = await getDocs(query(
        collection(db, 'sti_demographics'),
        where('year', '==', filters.year),
        where('sti_type', '==', 'All'),
        where('gender', '==', 'all'),
        where('sexual_orientation', '==', 'all'),
        orderBy('age_group')
      ));
      const demoAge = demoAgeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const demoGenderSnap = await getDocs(query(
        collection(db, 'sti_demographics'),
        where('year', '==', filters.year),
        where('sti_type', '==', 'All'),
        where('age_group', '==', 'all'),
        where('sexual_orientation', '==', 'all')
      ));
      const demoGender = demoGenderSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((d: any) => d.gender !== 'all');

      const geoSnap = await getDocs(query(
        collection(db, 'sti_geographic'),
        where('year', '==', filters.year),
        where('sti_type', '==', 'All'),
        orderBy('cases', 'desc'),
        limit(10)
      ));
      const geo = geoSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const trendsSnap = await getDocs(query(collection(db, 'sti_trend_data'), where('year', '==', filters.year), orderBy('month')));
      const trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (national) setNationalStats(national as NationalStats);
      setSTITypeData(types);
      setDemographicsAge(demoAge);
      setDemographicsGender(demoGender);
      setGeographicData(geo);
      setTrendData(trends);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting as ${format}...`);
  };

  const handleResetFilters = () => {
    setFilters({
      year: 2024,
      stiType: ['All'],
      ageGroups: ['15-19', '20-24', '25-29', '30-39', '40+'],
      genders: ['All'],
      regions: ['All'],
    });
  };

  const COLORS = {
    blue: '#3B82F6',
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
  };

  const PIE_COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sexual Health Statistics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Data-driven insights into STI trends and demographics
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
          {nationalStats && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: {new Date(nationalStats.last_updated).toLocaleDateString()}</span>
              <span>Source: {nationalStats.data_source}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        <div className="hidden lg:block flex-shrink-0">
          <FilterSidebar
            isOpen={true}
            onClose={() => setSidebarOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            onExport={handleExport}
          />
        </div>

        {sidebarOpen && (
          <FilterSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            onExport={handleExport}
          />
        )}

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {nationalStats && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">National Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Annual STI Cases Reported"
                  value={`${(nationalStats.total_cases / 1000000).toFixed(1)}M+`}
                  subtitle="Reported cases"
                  trend={{
                    value: nationalStats.year_over_year_change,
                    direction: nationalStats.year_over_year_change > 0 ? 'up' : 'down',
                  }}
                  icon={FileText}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-100"
                />
                <StatsCard
                  title="Will Contract an STI"
                  value={`1 in ${Math.round(nationalStats.lifetime_risk)}`}
                  subtitle="In their lifetime"
                  icon={Users}
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-100"
                />
                <StatsCard
                  title="Get Tested Annually"
                  value={`${(nationalStats.testing_rate * 100).toFixed(0)}%`}
                  subtitle="Despite CDC recommendations"
                  icon={ClipboardCheck}
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-100"
                />
                <StatsCard
                  title="Cases in Ages 15-24"
                  value={`${nationalStats.youth_percentage.toFixed(0)}%`}
                  subtitle="Young adults most affected"
                  icon={Calendar}
                  iconColor="text-red-600"
                  iconBgColor="bg-red-100"
                />
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">By STI Type</h2>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
                {['All', 'HIV', 'Chlamydia', 'Gonorrhea', 'Syphilis', 'HPV', 'Herpes'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTab(type)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedTab === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stiTypeData.filter((d) => d.sti_type !== 'All')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sti_type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_cases" fill={COLORS.blue} name="Total Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">What This Means</h3>
                <p className="text-sm text-blue-800">
                  Chlamydia remains the most reported STI, followed by gonorrhea and syphilis. Early detection and
                  treatment are crucial for preventing long-term health complications.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Demographics Breakdown</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsAge}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age_group" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cases" fill={COLORS.purple} name="Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">
                    <span className="font-semibold">Highest Risk:</span> Ages 20-24 show the highest infection rates,
                    emphasizing the need for targeted education and prevention programs.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicsGender}
                        dataKey="cases"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {demographicsGender.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Geographic Data</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin size={20} />
                <span>Top 10 Affected States</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">State</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Cases</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Rate per 100k</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geographicData.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">#{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{item.state}</td>
                        <td className="py-3 px-4 text-gray-600">{item.region}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {item.cases.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.rate_per_100k.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trends Over Time</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends ({filters.year})</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke={COLORS.blue}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Cases"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Take Action</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Get Tested</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Regular testing is the first step in maintaining sexual health.
                  </p>
                  <a href="#" className="text-sm font-medium hover:underline">
                    Find a clinic near you →
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Learn More</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Access educational resources about prevention and treatment.
                  </p>
                  <a href="#" className="text-sm font-medium hover:underline">
                    Browse resources →
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Share Results Securely</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Use MyHealthStatus to share verified results with partners.
                  </p>
                  <a href="#" className="text-sm font-medium hover:underline">
                    Get started →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer className="border-t border-gray-200 pt-8 mt-8">
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Data Sources & Citations</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  • Centers for Disease Control and Prevention (CDC) - STD Surveillance Reports
                  <a href="https://www.cdc.gov/std/statistics/" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline inline-flex items-center">
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </p>
                <p>
                  • World Health Organization (WHO) - Global Health Observatory
                  <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline inline-flex items-center">
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </p>
                <p>• State Health Departments - Regional surveillance data</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Disclaimer:</span> This data is for educational purposes.
                  Statistics are aggregated from public health sources and may not reflect real-time data.
                  Consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
