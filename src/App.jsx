import React, { useState, useEffect } from 'react';
import { Plus, Users, DollarSign, TrendingUp, Home, User, CreditCard, Calendar, Search, X } from 'lucide-react';

const FamilyBankSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, loansRes, depositsRes] = await Promise.all([
        window.storage.get('members').catch(() => null),
        window.storage.get('loans').catch(() => null),
        window.storage.get('deposits').catch(() => null)
      ]);

      if (membersRes?.value) setMembers(JSON.parse(membersRes.value));
      if (loansRes?.value) setLoans(JSON.parse(loansRes.value));
      if (depositsRes?.value) setDeposits(JSON.parse(depositsRes.value));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMembers = async (data) => {
    try {
      await window.storage.set('members', JSON.stringify(data));
      setMembers(data);
    } catch (error) {
      console.error('Error saving members:', error);
      alert('Failed to save members');
    }
  };

  const saveLoans = async (data) => {
    try {
      await window.storage.set('loans', JSON.stringify(data));
      setLoans(data);
    } catch (error) {
      console.error('Error saving loans:', error);
      alert('Failed to save loans');
    }
  };

  const saveDeposits = async (data) => {
    try {
      await window.storage.set('deposits', JSON.stringify(data));
      setDeposits(data);
    } catch (error) {
      console.error('Error saving deposits:', error);
      alert('Failed to save deposits');
    }
  };

  const addMember = async (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      joinDate: new Date().toISOString(),
      totalDeposits: 0,
      interestEarned: 0
    };
    await saveMembers([...members, newMember]);
    setShowAddMember(false);
  };

  const addLoan = async (loanData) => {
    const newLoan = {
      id: Date.now().toString(),
      ...loanData,
      issueDate: new Date().toISOString(),
      remainingAmount: parseFloat(loanData.amount),
      status: 'active'
    };
    await saveLoans([...loans, newLoan]);
    setShowAddLoan(false);
  };

  const addDeposit = async (depositData) => {
    const newDeposit = {
      id: Date.now().toString(),
      ...depositData,
      date: new Date().toISOString()
    };
    const updatedDeposits = [...deposits, newDeposit];
    await saveDeposits(updatedDeposits);
    
    const member = members.find(m => m.id === depositData.memberId);
    if (member) {
      const updatedMembers = members.map(m => 
        m.id === depositData.memberId 
          ? { ...m, totalDeposits: m.totalDeposits + parseFloat(depositData.amount) }
          : m
      );
      await saveMembers(updatedMembers);
    }
    setShowAddDeposit(false);
  };

  const calculateMonthlyInterest = (principal, annualRate = 6) => {
    return (principal * annualRate / 100 / 12);
  };

  const calculateEMI = (loanAmount, emiAmount = 2000) => {
    const monthlyInterest = calculateMonthlyInterest(loanAmount);
    return emiAmount + monthlyInterest;
  };

  const getTotalDeposits = () => {
    return deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  };

  const getTotalLoans = () => {
    return loans.filter(l => l.status === 'active').reduce((sum, l) => sum + parseFloat(l.remainingAmount), 0);
  };

  const getAvailableFunds = () => {
    return getTotalDeposits() - getTotalLoans();
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mobile?.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bank data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Family Bank</h1>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-indigo-600">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'deposits', label: 'Deposits', icon: TrendingUp },
              { id: 'loans', label: 'Loans', icon: CreditCard }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-indigo-600'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            members={members}
            loans={loans}
            deposits={deposits}
            getTotalDeposits={getTotalDeposits}
            getTotalLoans={getTotalLoans}
            getAvailableFunds={getAvailableFunds}
          />
        )}

        {activeTab === 'members' && (
          <Members 
            members={filteredMembers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowAddMember={setShowAddMember}
            deposits={deposits}
            loans={loans}
            calculateMonthlyInterest={calculateMonthlyInterest}
          />
        )}

        {activeTab === 'deposits' && (
          <Deposits 
            deposits={deposits}
            members={members}
            setShowAddDeposit={setShowAddDeposit}
          />
        )}

        {activeTab === 'loans' && (
          <Loans 
            loans={loans}
            members={members}
            setShowAddLoan={setShowAddLoan}
            calculateEMI={calculateEMI}
          />
        )}
      </div>

      {showAddMember && (
        <AddMemberModal 
          onClose={() => setShowAddMember(false)}
          onAdd={addMember}
        />
      )}

      {showAddLoan && (
        <AddLoanModal 
          members={members}
          onClose={() => setShowAddLoan(false)}
          onAdd={addLoan}
        />
      )}

      {showAddDeposit && (
        <AddDepositModal 
          members={members}
          onClose={() => setShowAddDeposit(false)}
          onAdd={addDeposit}
        />
      )}
    </div>
  );
};

const Dashboard = ({ members, loans, deposits, getTotalDeposits, getTotalLoans, getAvailableFunds }) => {
  const activeLoans = loans.filter(l => l.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Deposits"
          value={`₹${getTotalDeposits().toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          title="Active Loans"
          value={`₹${getTotalLoans().toLocaleString('en-IN')}`}
          icon={CreditCard}
          color="orange"
        />
        <StatCard 
          title="Available Funds"
          value={`₹${getAvailableFunds().toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard 
          title="Total Members"
          value={members.length}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Deposits</h3>
          <div className="space-y-3">
            {deposits.slice(-5).reverse().map(deposit => {
              const member = members.find(m => m.id === deposit.memberId);
              return (
                <div key={deposit.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-800">{member?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{new Date(deposit.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-green-600">+₹{parseFloat(deposit.amount).toLocaleString('en-IN')}</p>
                </div>
              );
            })}
            {deposits.length === 0 && (
              <p className="text-gray-500 text-center py-4">No deposits yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Loans</h3>
          <div className="space-y-3">
            {activeLoans.slice(0, 5).map(loan => {
              const member = members.find(m => m.id === loan.memberId);
              return (
                <div key={loan.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-800">{member?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">₹{parseFloat(loan.remainingAmount).toLocaleString('en-IN')} remaining</p>
                  </div>
                  <p className="font-semibold text-orange-600">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</p>
                </div>
              );
            })}
            {activeLoans.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active loans</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Members = ({ members, searchTerm, setSearchTerm, setShowAddMember, deposits, loans, calculateMonthlyInterest }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors ml-4"
        >
          <Plus size={20} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => {
          const memberDeposits = deposits.filter(d => d.memberId === member.id);
          const memberLoans = loans.filter(l => l.memberId === member.id && l.status === 'active');
          const totalDeposited = memberDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
          const interestEarned = calculateMonthlyInterest(totalDeposited) * (memberDeposits.length || 1);

          return (
            <div key={member.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.mobile}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deposits:</span>
                  <span className="font-semibold text-green-600">₹{totalDeposited.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest Earned:</span>
                  <span className="font-semibold text-blue-600">₹{interestEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Loans:</span>
                  <span className="font-semibold text-orange-600">{memberLoans.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No members found</p>
          <button
            onClick={() => setShowAddMember(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Your First Member
          </button>
        </div>
      )}
    </div>
  );
};

const Deposits = ({ deposits, members, setShowAddDeposit }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Deposit Records</h2>
        <button
          onClick={() => setShowAddDeposit(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Deposit</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deposits.slice().reverse().map(deposit => {
                const member = members.find(m => m.id === deposit.memberId);
                return (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(deposit.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {member?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ₹{parseFloat(deposit.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {deposit.type || 'Regular'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {deposits.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No deposits recorded yet</p>
            <button
              onClick={() => setShowAddDeposit(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Record First Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Loans = ({ loans, members, setShowAddLoan, calculateEMI }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Loan Records</h2>
        <button
          onClick={() => setShowAddLoan(true)}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          <span>Issue Loan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loans.map(loan => {
          const member = members.find(m => m.id === loan.memberId);
          const emiAmount = calculateEMI(loan.remainingAmount, loan.emiAmount || 2000);
          const monthlyInterest = (parseFloat(loan.remainingAmount) * 6 / 100 / 12);

          return (
            <div key={loan.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{member?.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">{new Date(loan.issueDate).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {loan.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Loan Amount:</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="font-semibold text-orange-600">₹{parseFloat(loan.remainingAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">EMI Amount:</span>
                  <span className="font-semibold text-blue-600">₹{loan.emiAmount || 2000}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Interest:</span>
                  <span className="font-semibold text-red-600">₹{monthlyInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-gray-700">Total Monthly Payment:</span>
                  <span className="font-bold text-indigo-600">₹{emiAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loans.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No loans issued yet</p>
          <button
            onClick={() => setShowAddLoan(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Issue First Loan
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const AddMemberModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', mobile: '', address: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.mobile) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Add New Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddLoanModal = ({ members, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ memberId: '', amount: '', emiAmount: '2000' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.memberId && formData.amount) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Issue New Loan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a member...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (Max ₹50,000)</label>
            <input
              type="number"
              required
              max="50000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly EMI Amount (Default ₹2,000)</label>
            <input
              type="number"
              required
              min="2000"
              value={formData.emiAmount}
              onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Issue Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddDepositModal = ({ members, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ memberId: '', amount: '500', type: 'Regular' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.memberId && formData.amount) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Add Deposit</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a member...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Regular">Regular Monthly</option>
              <option value="Extra">Extra Deposit</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyBankSystem;
