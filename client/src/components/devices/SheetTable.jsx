import { message } from 'antd'
import React from 'react'
import templateRaw from '../../constants/template.txt'

export default function SheetTable({ record, sheets }) {
    const getAppsCriptFile = sheet => {
        fetch(templateRaw)
            .then(r => r.text())
            .then(text => {
                console.log(sheets)
                console.log(sheets[sheet.DocumentId]?.map(item => item.SheetName))
                const a = [... new Set(sheets[sheet.DocumentId]?.map(item => `"${item.SheetName}"`))]
                console.log(a.join(", "))
                navigator.clipboard.writeText(text.replaceAll("#SHEET_NAMES", a))
                message.success("Đã copy file AppScript vào bộ nhớ tạm.")

            }).catch(err => {
                message.error("Đã xảy ra lỗi khi copy. Vui lòng thử lại. " + err.message)
            });
    }

    return (
        <table className='table table-hover' style={{ maxWidth: "80%" }}>
            <thead>
                <tr>
                    <th scope='col'>Sheet Name</th>
                    <th scope='col'>Document ID</th>
                    <th scope='col'>AppScript</th>
                    <th scope='col'>Google Sheet</th>
                </tr>
            </thead>
            <tbody>
                {record?.Sheets?.map((sheet) => (
                    <tr
                        key={`${sheet.DocumentId} ${sheet.SheetName}`}
                    >
                        <td>{sheet.SheetName}</td>
                        <td>{sheet.DocumentId}</td>
                        <td>
                            <img
                                onClick={() => getAppsCriptFile(sheet)}
                                style={{ cursor: "pointer" }}
                                width="24" height="24"
                                src="https://img.icons8.com/ios/50/copy.png"
                                alt="Copy AppScript file"
                                title='Copy AppScript file'
                            />
                        </td>
                        <td>
                            <a target='_blank' href={`https://docs.google.com/spreadsheets/d/${sheet.DocumentId}/edit?gid=0#gid=0`}>Go to Sheet</a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
