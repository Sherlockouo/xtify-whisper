import Database from "tauri-plugin-sql-api";

const wrapper = async (fn: (db: Database) => Promise<unknown>) => {
    const db = await Database.load("sqlite:transcribe.db");
    const result = await fn(db);
    await db.close();
    return result
}

export const initDatabase = async () => {
    wrapper(async (db) => {        
        await db.execute(
            "CREATE TABLE IF NOT EXISTS transcribed_files(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,file_name TEXT NOT NULL,file_type TEXT NOT NULL,origin_file_path TEXT NOT NULL,file_path TEXT NOT NULL, duration INTEGER NOT NULL,model TEXT NOT NULL, create_timestamp TIMESTAMP INTEGER NOT NULL ,update_timestamp INTEGER NOT NULL,status INTEGER DEFAULT 1)"
        );
    });
}
export const dropDatabase = async () => {
    wrapper(async (db) => {
        await db.execute(
            "DROP TABLE IF EXISTS transcribed_files;"
        );
    });
}

export const getTotal = async () => {
    return wrapper(async (db) => {
        return await db.select("SELECT COUNT(*) FROM transcribed_files WHERE status = 1 ");
    });
}

export const getDataByPage = async (page: number) => {
    return wrapper(async (db) => {
        return await db.select(
            "SELECT * FROM transcribed_files WHERE status = 1 ORDER BY id DESC LIMIT 20 OFFSET $1",
            [20 * (page - 1)]
        );
    });
}

export const searchByKeyword = async (searchKeyWord: string, page: number) => {
    return wrapper(async (db) => {
        return await db.select(
            "SELECT * FROM transcribed_files WHERE status = 1 AND file_name LIKE $1 OR file_type LIKE $1 OR file_path LIKE $1 OR text LIKE $1 ORDER BY id DESC LIMIT 20 OFFSET $2",
            ["%" + searchKeyWord + "%", 20 * (page - 1)]
        );
    });
}

export const updateByFilename = async (text: string, duration: number, file_name: string, model: string) => {
    return wrapper(async (db) => {
        const res = await db.execute(
            "UPDATE transcribed_files SET text=$1, duration=$2,model=$3,update_timestamp=$4 WHERE file_name=$5",
            [text, duration, model, Date.now(),file_name,]
        );
    })
}

export const deleteByID = async (id: number) => {
    return wrapper(async (db) => {
        await db.execute(" UPDATE transcribed_files SET status=$1 where id = $2", [0,id])
    });
}

export const findByFilename = async (filename: string) => {
    return wrapper(async (db) => {
        return await db.select(
            "select * FROM transcribed_files WHERE status = 1 AND file_name = $1",
            [filename])
    })
}

export const addTranscribeFile = async (text: string, fileName: string, fileType: string, origin_file_path: string, filePath: string, duration: number, model: string) => {
    return wrapper(async (db) => {
        return await db
            .execute(
                "INSERT into transcribed_files (text, file_name, file_type,origin_file_path , file_path, duration,model,create_timestamp,update_timestamp) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9)",
                [
                    text,
                    fileName,
                    fileType,
                    origin_file_path,
                    filePath,
                    duration,
                    model,
                    Date.now(),
                    Date.now(),
                ]
            )
    });
}
