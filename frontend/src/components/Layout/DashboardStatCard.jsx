const DashboardStatCard = ({ title, value, icon, color = 'cyan' }) => {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-gray-800/50 border border-white/10 rounded-xl p-5 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardStatCard;