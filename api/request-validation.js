// Validação compartilhável no servidor (sem dependências).
// Não importe esta rotina como substituto de autenticação, rate limit ou antispam.
export const STATUSES = Object.freeze(["new","reviewing","proposed","approved","declined","completed","cancelled"]);
export function validateRequest(payload, now = new Date()) {
  const errors = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {ok:false,errors:["Corpo da solicitação inválido"]};
  const str = (key, max) => {
    const value = payload[key];
    if (value == null || value === "") return "";
    if (typeof value !== "string" || value.length > max) {errors.push(key+" inválido");return "";}
    return value.trim();
  };
  const client_name=str("client_name",120), client_phone=str("client_phone",30), service_id=str("service_id",80);
  const location=str("location",200), details=str("details",2000);
  const preferred_date=str("preferred_date",10), preferred_time=str("preferred_time",5);
  if(client_name.length<2)errors.push("Nome obrigatório");
  if(!/^\+?[\d\s().-]{8,30}$/.test(client_phone))errors.push("Telefone inválido");
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(service_id))errors.push("Serviço inválido");
  if(payload.consent !== true)errors.push("Consentimento obrigatório");
  if(preferred_date) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(preferred_date) || !Number.isFinite(Date.parse(preferred_date+"T12:00:00Z")) || new Date(preferred_date+"T12:00:00Z").toISOString().slice(0,10)!==preferred_date) errors.push("Data inválida");
    else if(preferred_date<new Date(now.getTime()-12*3600*1000).toISOString().slice(0,10)) errors.push("Data anterior ao dia atual");
  }
  if(preferred_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferred_time))errors.push("Horário inválido");
  return {ok:errors.length===0,errors,value:{client_name,client_phone,service_id,preferred_date:preferred_date||null,preferred_time:preferred_time||null,location,details}};
}
