import React from 'react';

// UsageComponent: Display CPU, RAM, and Storage usage
const UsageComponent = ({ usage }) => {
    if (!usage) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading system usage...
            </div>
        );
    }

    const { cpu, ram, storage } = usage;

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tình trạng hệ thống</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CPU Usage */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <h5 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        CPU Usage
                    </h5>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Used:</span>
                            <span className="text-sm font-semibold text-blue-900">{cpu.usagePercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${cpu.usagePercent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Available:</span>
                            <span className="text-sm font-semibold text-green-600">{cpu.availablePercent}%</span>
                        </div>
                    </div>
                </div>

                {/* RAM Usage */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <h5 className="text-base font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        RAM Usage
                    </h5>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Total:</span>
                            <span className="text-sm font-semibold text-purple-900">{ram.totalMem}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Used:</span>
                            <span className="text-sm font-semibold text-purple-900">{ram.used} ({ram.usagePercent}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${ram.usagePercent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Available:</span>
                            <span className="text-sm font-semibold text-green-600">{ram.free} ({ram.availablePercent}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageComponent;
