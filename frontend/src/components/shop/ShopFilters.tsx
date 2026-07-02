export default function ShopFilters() {
  return (
    <div className="border rounded-xl p-6 bg-white sticky top-24">
      <h2 className="text-xl font-semibold mb-6">
        Filters
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">
            Category
          </h3>

          <div className="space-y-2">
            <label className="block">
              <input type="checkbox" /> Banarasi
            </label>

            <label className="block">
              <input type="checkbox" /> Kanjivaram
            </label>

            <label className="block">
              <input type="checkbox" /> Silk
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">
            Price
          </h3>

          <input
            type="range"
            min="1000"
            max="20000"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}