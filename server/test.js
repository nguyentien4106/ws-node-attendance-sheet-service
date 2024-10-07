import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
    // env var values here are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    email: "nguyentien0620@attendancedataapi.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUTT56G2jKacNT\nkiA/HbdM5839TzWEh4+0LNRyBv8yq4xtzTRJFpPJrapZdO7oqVOJ13fz9YVi8XFP\n26LwlN7PwWkVITVpVhI9MRdtkUhFwtzCU0UGRQPNHNfh0k0joEkO2byTRQ64vnVg\nWsRlTBdgw4f/pB2nMgCIsk4gizTL5E5rUN/csBSNhSilGkouo9QYm2iakBV0xqpi\nzHc8UhXAZzFqJ2oTNnjg4G2piI59yQ2RVLEOxSDXj0oy+O1fdaaAauvY1hhJ5nrB\nRkRfNgrCLZcYj/CCwXgaY+lYy+y5/hAsdMs/ouVkhIDkXDLdyL+M4P2jI1x0mrpd\nMqZebp3TAgMBAAECggEAHBvCCt64KByKrPTq6hBgJYGHZ2NmXY6pOxy4YASHI0lN\nRXhm1Mp1dL1WkZOG0i0hD14E1rsKFwiKjR0yXJIJUg50gESuUqz/qzRluq8Cl6Hu\nIphtyh+3GiAYgSCb7/yXz6yKaCE7isBEwCYkXJkPe1NIHVO4TVu0cGTTLUHhEqGA\n9UTVmy7G1o5VpkPJciVzeHaZ41NC+OkQiht7QJGgqG6HINlWD4C7eCfRHr1O7ykK\n/syR3/aeNGoEMV5n6sAM+Q0/LQmUK9fDAb5SUSHAF4yZkyIzmo4WrD9fdztpO54R\nozCg5AUAYjvfTgKwBB+5Lxv4rJyaPTWuk16f9hbmAQKBgQDuKASR+cYsIgZ1tmE+\npiKGb7Qt4RkuPQwKfqPXoT1rPTblF3ZB/E761Le7LwCLqs/kf4jZuoHpMpD2OaSL\nIahC+qecyw+dyY4iLicrBj1A16uYV5FkU69V9HuFKUjg3ir8fuSo0rhont3JaI8G\nnxO/6HSj07kkLbU5f2qA2WpfAQKBgQDkNVHTNhJ5azHdyHlEef4VhH57fIGaps7K\nou0iXOQve2Tx6fEQOd8sWzCYju9XVlKUjf0IYJwioyDUNp6qIuVxLfRlQur/V5pg\n992SCDgnukdtbbaRPHHk8sb4+3jD9VYBQqKhco3k6WbTg+K1nihoB6Nhfk1euaqm\nkexHQBJQ0wKBgBg5Rc27RCb1BwcuF9IRf+2AqykHflIvr2vZ2bxzEBY6Ub0Xl9W6\nXiYxQMbvTvTl2ON6/WZ4DAK2O/xvfIcSU1UMvcO6+8mm2KgtXZqIte5EgZWrQoSb\n5netuGqg+mK09lZcadGqLUum7RQxaGrZ/15DvKl1PZ2qcIZ6qVCVzLYBAoGASX9O\nqhqJGqfGeKpfPAmaJm30mmrABwHgKe0NOHr4Vr6EBVGV/ObWlJ+N6CRouxUnJYcR\nTkhnINSu9wncUelJQglN4+sIalJZew95QdX51/mrlXe3S9FO0TDLmlbLTzlNiLxg\nSmTthCMTpd2c/2c/ljmXige2fWKIrnriwRPGklcCgYAIUebzGqNrQyGQU0UiJ8fq\nw3irUUNToMrQKol1axD1ws9uGNHdU7AfuUR1vxs/RHEEsDtTYrmmV6vEGcXzZN5S\nPnmKwznwo/J3GteGJ9Pwyux5idZTq6JJ88Y7zFA5I8LtxOyZB6HSiZ0LikP1OYgU\nXRZrmxFeWRhj96T81qSkUQ==\n-----END PRIVATE KEY-----\n",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

try {
    const doc = new GoogleSpreadsheet(
        "1qPrnFffcnwIAkRHoyQnsuuAGkZaC1l3SSCn2KuZH3Zo1",
        serviceAccountAuth
    );
    await doc.loadInfo()
    // let sheet
    // if(!("Sheet2" in doc.sheetsByTitle)){
    //     console.log('add')
    //     sheet = await doc.addSheet({ title: 'Sheet2' });
    //     console.log('added')
        
    // }
    
    // sheet = doc.sheetsByTitle["Sheet2"];
    // // sheet.addRow()
    // sheet.getRows()
    // console.log(sheet.title);
    // console.log(sheet.rowCount);
} catch (err) {
    console.log(err.message);
    console.log(err.code);
    console.log(err);
}
