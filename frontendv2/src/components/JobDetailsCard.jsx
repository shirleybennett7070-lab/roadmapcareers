export default function JobDetailsCard({ jobInfo }) {
  return (
    <div className="mb-16 bg-white rounded-lg shadow-lg p-8 border border-gray-200 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Role You're Interested In
      </h2>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="space-y-3 text-gray-700">
          <div className="flex">
            <span className="font-semibold min-w-[120px]">Role:</span>
            <span className="font-bold text-gray-900">{jobInfo.title}</span>
          </div>
          <div className="flex">
            <span className="font-semibold min-w-[120px]">Company:</span>
            <span>{jobInfo.company}</span>
          </div>
          <div className="flex">
            <span className="font-semibold min-w-[120px]">Pay:</span>
            <span>{jobInfo.pay}</span>
          </div>
          <div className="flex">
            <span className="font-semibold min-w-[120px]">Location:</span>
            <span>{jobInfo.location}</span>
          </div>
          <div className="flex">
            <span className="font-semibold min-w-[120px]">Type:</span>
            <span>{jobInfo.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
