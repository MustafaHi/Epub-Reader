// Stream 1.0

import { encode, decode } from "@sciter"
import { fs } from "@sys"

export async function read(path)
{
    try
    {
        let    file = await fs.readfile(path);
        let    data = decode(file);
        return data;
    }
    catch (error)
    {
        return false;
    }
}
export async function readRaw(path)
{
    try
    {
        let    data = await fs.readfile(path);
        return data;
    }
    catch (error)
    {
        return false;
    }
}
export function readSync(path)
{
    let    data = decode(fs.$readfile(path));
    return data;
}
export function readRawSync(path)
{
        let    data = fs.$readfile(path);
        return data;
}

export async function write(path, data)
{
    try
    {
        let   file = await fs.open(path, "w");
        await file.write(typeof data == "object" ? JSON.stringify(data, " ") : data);
        return await file.close();
    }
    catch (error)
    {
        return false;
    }
}
export function writeSync(path, data)
{
    let    file = fs.$open(path, "w");
           file.$write(typeof data == "object" ? JSON.stringify(data, " ") : data);
    return file.$close();
}