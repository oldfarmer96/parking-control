import { supabase } from "@/config/supabase";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";

export const dashboardApi = {
  async getStats() {
    const now = new Date();
    const startMonth = startOfMonth(now).toISOString();
    const endMonth = endOfMonth(now).toISOString();

    // Week bounds (Monday = start)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // 1. Total Revenue (This Month)
    const { data: revenueData, error: revenueError } = await supabase
      .from("tickets")
      .select("monto_cobrado")
      .eq("estado", "PAGADO")
      .gte("fecha_creacion", startMonth)
      .lte("fecha_creacion", endMonth);

    if (revenueError) throw new Error(revenueError.message);
    const totalRevenue = revenueData.reduce((acc, t) => acc + Number(t.monto_cobrado), 0);

    // 2. Active Tickets (Vehicles inside)
    const { count: activeTickets, error: activeError } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("estado", "PENDIENTE");

    if (activeError) throw new Error(activeError.message);

    // 3. Total Operators
    const { count: totalOperators, error: operatorsError } = await supabase
      .from("perfiles")
      .select("*", { count: "exact", head: true })
      .eq("rol", "operador");

    if (operatorsError) throw new Error(operatorsError.message);

    // 4. Recent Activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("tickets")
      .select(`
        id,
        placa,
        monto_cobrado,
        estado,
        fecha_creacion,
        perfiles (nombre_completo)
      `)
      .order("fecha_creacion", { ascending: false })
      .limit(6);

    if (activityError) throw new Error(activityError.message);

    // 5. Weekly Revenue (Current week Mon-Sun)
    const { data: weeklyData, error: weeklyError } = await supabase
      .from("tickets")
      .select("monto_cobrado, fecha_creacion")
      .eq("estado", "PAGADO")
      .gte("fecha_creacion", weekStart.toISOString())
      .lte("fecha_creacion", weekEnd.toISOString());

    if (weeklyError) throw new Error(weeklyError.message);

    const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const weeklyRevenue = dayLabels.map((label, i) => {
      const dayDate = addDays(weekStart, i);
      const dayTotal = (weeklyData || [])
        .filter((t) => isSameDay(new Date(t.fecha_creacion), dayDate))
        .reduce((acc, t) => acc + Number(t.monto_cobrado), 0);
      return { dia: label, monto: dayTotal };
    });

    return {
      totalRevenue,
      activeTickets: activeTickets || 0,
      totalOperators: totalOperators || 0,
      weeklyRevenue,
      recentActivity: recentActivity.map((t: any) => ({
        id: t.id,
        placa: t.placa,
        monto: t.monto_cobrado,
        estado: t.estado,
        fecha: t.fecha_creacion,
        operador: t.perfiles?.nombre_completo || "Sistema"
      }))
    };
  }
};
