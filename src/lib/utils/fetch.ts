import { request } from 'undici'

export async function fetch<T>(url: string){
    const response = await request(url)
    const json = await response.body.json()
    if(response.statusCode !== 200) return undefined	
    
    return json as T
}