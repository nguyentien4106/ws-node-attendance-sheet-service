import os from 'os'
// import disk from 'diskusage'

// Function to calculate CPU usage at a specific point
export const getCPUUsage = () => {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    console.log(cpus)
    cpus.forEach(cpu => {
        const { user, nice, sys, idle, irq } = cpu.times;
        totalIdle += idle;
        totalTick += user + nice + sys + idle + irq;
    });

    const usagePercent = ((totalTick - totalIdle) / totalTick) * 100;
    const availablePercent = 100 - usagePercent;
    console.log(usagePercent)
    console.log(availablePercent)
    return {
        usagePercent: usagePercent.toFixed(2),
        availablePercent: availablePercent.toFixed(2),
    };
};

export const getRAMUsage = () => {
    const totalMem = os.totalmem(); // Total system memory in bytes
    const freeMem = os.freemem(); // Free system memory in bytes
    const usedMem = totalMem - freeMem; // Used memory in bytes

    const usagePercent = (usedMem / totalMem) * 100; // Percentage of RAM used
    const availablePercent = 100 - usagePercent; // Percentage of RAM available

    return {
        totalMem: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', // Convert to GB
        usedMem: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', // Convert to GB
        freeMem: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', // Convert to GB
        usagePercent: usagePercent.toFixed(2),
        availablePercent: availablePercent.toFixed(2),
    };
};

const path = '/'; // Root path or specific drive (e.g., "C:" on Windows)

// export const getStorageUsage = async () => {
//     try {
//         const { available, free, total } = await disk.check(path);

//         const used = total - free;
//         const usagePercent = (used / total) * 100;
//         const availablePercent = (available / total) * 100;

//         return {
//             total: (total / 1024 / 1024 / 1024).toFixed(2) + ' GB', // Convert to GB
//             used: (used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
//             free: (free / 1024 / 1024 / 1024).toFixed(2) + ' GB',
//             available: (available / 1024 / 1024 / 1024).toFixed(2) + ' GB',
//             usagePercent: usagePercent.toFixed(2),
//             availablePercent: availablePercent.toFixed(2),
//         };
//     } catch (error) {
//         console.error('Error fetching disk usage:', error);
//     }
// };
