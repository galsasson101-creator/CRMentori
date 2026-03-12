import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Brain, CreditCard, FileText, Target, Calendar, MessageCircle } from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { SUBSCRIPTION_COLORS } from '../../lib/constants.js';
import { formatCurrency, formatDate, capitalize } from '../../lib/formatters.js';
import FinancialsPanel from './FinancialsPanel.jsx';

function hashColor(str) {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, loading, error } = useApi(
    useCallback(() => api.get(`/users/${id}`), [id])
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>
        <p className="text-red-500 text-sm">{error || 'User not found'}</p>
      </div>
    );
  }

  const name = user.name || 'Unknown';
  const status = user.subscriptionStatus || 'free';
  const statusColor = SUBSCRIPTION_COLORS[status] || '#c4c4c4';
  const avatarColor = hashColor(name);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || '--'}</p>
                {user.phone && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.phone}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: statusColor }}
                  >
                    {capitalize(status)}
                  </span>
                  {user.tier && user.tier !== 'free' && (
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                      {user.tier}
                    </span>
                  )}
                  {user.emailVerified && (
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(user.lastLoginAt)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{(user.courses || []).length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{user.notesCount || 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Sessions</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{user.aiTeacherSessions || 0}</p>
              </div>
            </div>

            {/* Courses */}
            {user.courses && user.courses.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Enrolled Courses</label>
                <div className="flex flex-wrap gap-2">
                  {user.courses.map((c) => (
                    <span key={c} className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Course Progress */}
          {user.courseProgress && user.courseProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target size={18} className="text-blue-500" />
                Course Progress
              </h3>
              <div className="space-y-3">
                {user.courseProgress.map((cp) => (
                  <div key={cp.course}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cp.course}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {cp.topicsCompleted}/{cp.topicsTotal} topics ({cp.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2 transition-all"
                        style={{ width: `${cp.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Performance */}
          {user.answerStats && user.answerStats.totalAnswers > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-green-500" />
                Answer Performance
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.answerStats.totalAnswers}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Answers</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{user.answerStats.totalCorrect}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{user.answerStats.accuracy}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                </div>
              </div>
              {user.answerStats.byCourse && user.answerStats.byCourse.length > 0 && (
                <div className="space-y-2">
                  {user.answerStats.byCourse.map((cs) => (
                    <div key={cs.course} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{cs.course}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {cs.correct}/{cs.totalAnswers} correct ({cs.accuracy}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Usage */}
          {user.aiUsage && user.aiUsage.totalAiInteractions > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Brain size={18} className="text-purple-500" />
                AI Usage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{user.aiUsage.humanitiesQuestions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Questions (Humanities)</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{user.aiUsage.videoAiMath}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Questions (Math)</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{user.aiUsage.buddyQuestions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Buddy Questions</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{user.aiUsage.podcastListens}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Podcast Listens</p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Plans */}
          {user.learningPlans && user.learningPlans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" />
                Learning Plans
              </h3>
              <div className="space-y-3">
                {user.learningPlans.map((lp) => (
                  <div key={lp.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{lp.courseName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lp.totalDays} days plan &middot; {lp.dailyStudyTime} min/day
                      </p>
                    </div>
                    {lp.testDate && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Test Date</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(lp.testDate)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History */}
          {user.paymentHistory && user.paymentHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" />
                Payment History
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Plan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Valid Until</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {user.paymentHistory.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{p.planName}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 capitalize">{p.type}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-800 dark:text-gray-200">{formatCurrency(p.amount, 'ILS')}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{formatDate(p.completedAt)}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{formatDate(p.availableUntil)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscription History */}
          {user.subscriptionHistory && user.subscriptionHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Subscription History
              </h3>
              <div className="space-y-3">
                {user.subscriptionHistory.map((s) => (
                  <div key={s.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.planName}</span>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.isActive ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {s.isActive ? 'Active' : 'Cancelled'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatCurrency(s.planPrice, 'ILS')}/mo</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Started: {formatDate(s.createdAt)}</span>
                      {s.cancelledAt && <span className="text-red-500">Cancelled: {formatDate(s.cancelledAt)}</span>}
                      {s.cardBrand && s.cardSuffix && <span>Card: {s.cardBrand} ****{s.cardSuffix}</span>}
                      {s.payerPhone && <span>Phone: {s.payerPhone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Financials */}
        <div className="lg:col-span-1">
          <FinancialsPanel user={user} />
        </div>
      </div>
    </div>
  );
}
