import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Complete your profile</h1>
          <p className="text-gray-500 mt-2">Just a few more details to get started.</p>
        </div>

        <form action={completeOnboarding} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select
              name="role"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
            >
              <option value="buyer">Buyer (Brand / Creator)</option>
              <option value="manufacturer">Manufacturer / Factory</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
