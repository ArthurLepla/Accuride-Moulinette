// Configuration pour la rétention d'une agrégation
const aggregationRetentionConfig = {
  dataRetention: {
    sourceTypeId: "aggregation",
    settings: {
      timeSettings: {
        timeRange: {
          base: "year",
          factor: 6  // 6 ans directement
        }
      }
    }
  },
  inherited: null
}; 