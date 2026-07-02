export default function ProductFilters() {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <h2 className="font-semibold mb-4">
        Filters
      </h2>

      <div className="space-y-3">
        <label className="block">
          <input
            type="checkbox"
            className="mr-2"
          />
          Banarasi
        </label>

        <label className="block">
          <input
            type="checkbox"
            className="mr-2"
          />
          Silk
        </label>

        <label className="block">
          <input
            type="checkbox"
            className="mr-2"
          />
          Wedding
        </label>

        <label className="block">
          <input
            type="checkbox"
            className="mr-2"
          />
          Designer
        </label>
      </div>
    </div>
  );
}