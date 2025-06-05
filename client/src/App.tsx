
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { TideData, MarineConditions } from '../../server/src/schema';

function App() {
  const [tideData, setTideData] = useState<TideData[]>([]);
  const [asilomarConditions, setAsilomarConditions] = useState<MarineConditions | null>(null);
  const [loversPointConditions, setLoversPointConditions] = useState<MarineConditions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [tides, asilomar, loversPoint] = await Promise.all([
        trpc.getCoyotePointTides.query(),
        trpc.getMarineConditions.query('Asilomar State Beach'),
        trpc.getMarineConditions.query('Lovers Point')
      ]);

      setTideData(tides);
      setAsilomarConditions(asilomar);
      setLoversPointConditions(loversPoint);
    } catch (err) {
      console.error('Failed to load marine data:', err);
      setError('Failed to load marine conditions data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTideTypeColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-blue-500';
      case 'low': return 'bg-cyan-500';
      case 'rising': return 'bg-green-500';
      case 'falling': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading marine conditions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            🌊 Bay Area Marine Conditions
          </h1>
          <p className="text-blue-700">Real-time tide and wave data for your coastal adventures</p>
        </div>

        {/* Tide Data for Coyote Point */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              📍 Coyote Point - 48 Hour Tide Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {tideData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tide data available</p>
            ) : (
              <div className="space-y-4">
                {/* Tide Chart Visualization */}
                <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg p-4 h-64 overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {tideData.slice(0, 20).map((tide: TideData) => (
                      <div key={tide.id} className="flex flex-col items-center group">
                        <div 
                          className={`w-3 rounded-t-full ${getTideTypeColor(tide.type)} transition-all duration-300 group-hover:w-4`}
                          style={{ 
                            height: `${Math.max(20, (tide.height + 2) * 30)}px`
                          }}
                        ></div>
                        <div className="text-xs text-blue-800 mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="font-medium">{tide.height.toFixed(1)}ft</p>
                          <p>{formatTime(tide.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tide Legend */}
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>High Tide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                    <span>Low Tide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Rising</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Falling</span>
                  </div>
                </div>

                {/* Upcoming Tides List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {tideData.slice(0, 8).map((tide: TideData) => (
                    <div key={tide.id} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={`${getTideTypeColor(tide.type)} text-white`}>
                          {tide.type}
                        </Badge>
                        <span className="text-lg font-bold text-blue-900">
                          {tide.height.toFixed(1)}ft
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{formatDate(tide.timestamp)}</p>
                        <p>{formatTime(tide.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wave Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asilomar State Beach */}
          {asilomarConditions && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  🏖️ Asilomar State Beach
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {asilomarConditions.current_conditions.timestamp ? (
                  <div className="space-y-4">
                    <div className="text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-emerald-800 mb-3">Current Conditions</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-700">
                            {asilomarConditions.current_conditions.wave_height?.toFixed(1) || 'N/A'}ft
                          </div>
                          <div className="text-sm text-emerald-600">Wave Height</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-700">
                            {asilomarConditions.current_conditions.wind_speed?.toFixed(0) || 'N/A'}mph
                          </div>
                          <div className="text-sm text-emerald-600">Wind Speed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-700">
                            {asilomarConditions.current_conditions.wind_direction 
                              ? getWindDirection(asilomarConditions.current_conditions.wind_direction)
                              : 'N/A'}
                          </div>
                          <div className="text-sm text-emerald-600">Wind Direction</div>
                        </div>
                      </div>
                      <div className="text-xs text-emerald-600 mt-2">
                        Last updated: {formatTime(asilomarConditions.current_conditions.timestamp)}
                      </div>
                    </div>
                    
                    {asilomarConditions.forecast.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-emerald-800 mb-3">📈 Forecast</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {asilomarConditions.forecast.slice(0, 6).map((forecast, forecastIndex: number) => (
                              <div key={forecastIndex} className="flex justify-between items-center text-sm bg-emerald-50 rounded p-2">
                                <span className="font-medium">
                                  {formatTime(forecast.timestamp)}
                                </span>
                                <div className="flex gap-4">
                                  <span>{forecast.wave_height.toFixed(1)}ft</span>
                                  <span>{forecast.wind_speed.toFixed(0)}mph</span>
                                  <span>{getWindDirection(forecast.wind_direction)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No current conditions available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lovers Point */}
          {loversPointConditions && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  💕 Lovers Point
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loversPointConditions.current_conditions.timestamp ? (
                  <div className="space-y-4">
                    <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-3">Current Conditions</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            {loversPointConditions.current_conditions.wave_height?.toFixed(1) || 'N/A'}ft
                          </div>
                          <div className="text-sm text-purple-600">Wave Height</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            {loversPointConditions.current_conditions.wind_speed?.toFixed(0) || 'N/A'}mph
                          </div>
                          <div className="text-sm text-purple-600">Wind Speed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            {loversPointConditions.current_conditions.wind_direction 
                              ? getWindDirection(loversPointConditions.current_conditions.wind_direction)
                              : 'N/A'}
                          </div>
                          <div className="text-sm text-purple-600">Wind Direction</div>
                        </div>
                      </div>
                      <div className="text-xs text-purple-600 mt-2">
                        Last updated: {formatTime(loversPointConditions.current_conditions.timestamp)}
                      </div>
                    </div>
                    
                    {loversPointConditions.forecast.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-purple-800 mb-3">📈 Forecast</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {loversPointConditions.forecast.slice(0, 6).map((forecast, forecastIndex: number) => (
                              <div key={forecastIndex} className="flex justify-between items-center text-sm bg-purple-50 rounded p-2">
                                <span className="font-medium">
                                  {formatTime(forecast.timestamp)}
                                </span>
                                <div className="flex gap-4">
                                  <span>{forecast.wave_height.toFixed(1)}ft</span>
                                  <span>{forecast.wind_speed.toFixed(0)}mph</span>
                                  <span>{getWindDirection(forecast.wind_direction)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No current conditions available</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-600">
          <p className="text-sm">
            🌊 Stay safe and enjoy the waves! Data updates every hour.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
