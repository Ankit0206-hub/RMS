import React from 'react';

const DataTable = ({ columns, data, isLoading, emptyMessage = "No records found." }) => {
    return (
        <div className="bg-white  overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="text-xs uppercase bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className={`px-6 py-4 font-bold ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data?.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data?.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`px-6 py-4 ${col.cellClassName || ''}`}>
                                            {col.cell ? col.cell(row) : row[col.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { DataTable };
