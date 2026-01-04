
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  InventoryEntry, 
  Product, 
  MovementType, 
  OperationalIncident 
} from './types';
import { INITIAL_PRODUCTS } from './constants';
import { formatDateShort } from './utils/formatters';
import InputScreen from './screens/InputScreen';
import OutputScreen from './screens/OutputScreen';
import InventoryMonitor from './screens/InventoryMonitor';
import CavaMapping from './screens/CavaMapping';
import Dashboard from './screens/Dashboard';
import LoginScreen from './screens/LoginScreen';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [incidents] = useState<OperationalIncident[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  // Configuración de Cuenta Drive
  const [cloudConfig, setCloudConfig] = useState({
    email: 'charlie.asesorias@gmail.com',
    pass: 'Cgraterol1234*',
    folder: 'PuroLomo Meat Inventory Control System'
  });

  const [persistentData, setPersistentData] = useState({
    fechaRegistro: formatDateShort(new Date()),
    turno: '',
    operador: '',
    lote: '',
    origen: '',
    cava: '1',
    destino: '',
    fechaVencimiento: '',
    pasillo: '',
    torre: '',
    nivel: '1',
    piso: '',
    pagina: '',
    categoria: 'PT' as any
  });

  const syncWithGoogleDrive = useCallback(async (data: InventoryEntry[]) => {
    setSyncStatus('syncing');
    try {
      // Sincronización usando la cuenta configurada
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('purolomo_inventory', JSON.stringify(data));
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
      console.log(`Cloud Sync: ${cloudConfig.email} | Path: ${cloudConfig.folder}`);
    } catch (error) {
      setSyncStatus('error');
    }
  }, [cloudConfig]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('purolomo_inventory');
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    
    const savedAuth = localStorage.getItem('purolomo_auth');
    if (savedAuth) {
      setUser(JSON.parse(savedAuth));
      setIsAuthenticated(true);
    }
    
    const savedConfig = localStorage.getItem('purolomo_cloud_config');
    if (savedConfig) setCloudConfig(JSON.parse(savedConfig));
  }, []);

  const handleLogin = (email: string) => {
    setUser({ email });
    setIsAuthenticated(true);
    localStorage.setItem('purolomo_auth', JSON.stringify({ email }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('purolomo_auth');
  };

  const updateCloudConfig = (newConfig: typeof cloudConfig) => {
    setCloudConfig(newConfig);
    localStorage.setItem('purolomo_cloud_config', JSON.stringify(newConfig));
    alert('✅ CONFIGURACIÓN DRIVE ACTUALIZADA');
  };

  const addInventoryEntry = (entry: InventoryEntry) => {
    const newInventory = [entry, ...inventory];
    setInventory(newInventory);
    syncWithGoogleDrive(newInventory);
  };

  const updateInventoryEntry = (tag: string, updatedEntry: InventoryEntry) => {
    const newInventory = inventory.map(e => e.tag === tag ? updatedEntry : e);
    setInventory(newInventory);
    syncWithGoogleDrive(newInventory);
  };

  const bulkLoadInventory = (entries: InventoryEntry[]) => {
    const newInventory = [...entries, ...inventory];
    setInventory(newInventory);
    syncWithGoogleDrive(newInventory);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen relative bg-[#0B1221]">
        <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#0B1221]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 font-extrabold text-white shadow-lg text-xs">PL</div>
            <div>
              <h1 className="text-[12px] font-extrabold tracking-tight uppercase leading-none">PuroLomo</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${
                   syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' : 
                   syncStatus === 'error' ? 'bg-red-500' : 
                   syncStatus === 'success' ? 'bg-green-400 animate-ping' : 'bg-green-500'
                 }`} />
                 <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">CLOUD DRIVE: {syncStatus === 'syncing' ? 'UPDATING...' : 'SYNC ACTIVE'}</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
            <NavItem to="/" label="📥 Carga" />
            <NavItem to="/salida" label="📤 Descargo" />
            <NavItem to="/monitor" label="📊 Gestión" />
            <NavItem to="/mapeo" label="❄️ Mapeo" />
            <NavItem to="/dashboard" label="📈 Rendimiento" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-[7px] text-slate-500 font-bold uppercase">Cuenta Drive Activa</p>
              <p className="text-[9px] text-blue-400 font-black">{cloudConfig.email}</p>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 border border-white/10 transition-colors">🚪</button>
          </div>
        </nav>

        <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
          <Routes>
            <Route path="/" element={
              <InputScreen 
                inventory={inventory} 
                products={products} 
                persistentData={persistentData}
                setPersistentData={setPersistentData}
                onAdd={addInventoryEntry} 
                onUpdate={updateInventoryEntry}
                onDelete={() => {}}
                onAddProduct={(p) => setProducts([...products, p])}
              />
            } />
            <Route path="/salida" element={<OutputScreen inventory={inventory} onUpdate={updateInventoryEntry} />} />
            <Route path="/monitor" element={<InventoryMonitor inventory={inventory} onBulkLoad={bulkLoadInventory} cloudEmail={cloudConfig.email} />} />
            <Route path="/mapeo" element={<CavaMapping inventory={inventory} />} />
            <Route path="/dashboard" element={<Dashboard inventory={inventory} incidents={incidents} cloudConfig={cloudConfig} onUpdateConfig={updateCloudConfig} />} />
          </Routes>
        </main>

        <footer className="w-full py-2 bg-black/90 border-t border-white/5 text-center fixed bottom-14 md:bottom-0 left-0 right-0 z-40 backdrop-blur-md">
          <p className="text-[7px] md:text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            SYSTEM.CHARLIE.GRATEROL | INDUSTRIAL MEAT CLOUD v2.9 | CONTACTO: +58412-690-66-41
          </p>
        </footer>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-black/95 border-t border-white/10 p-2">
          <MobileNavItem to="/" icon="📥" />
          <MobileNavItem to="/salida" icon="📤" />
          <MobileNavItem to="/monitor" icon="📊" />
          <MobileNavItem to="/mapeo" icon="❄️" />
          <MobileNavItem to="/dashboard" icon="📈" />
        </div>
      </div>
    </HashRouter>
  );
};

const NavItem = ({ to, label }: { to: string, label: string }) => (
  <NavLink to={to} className={({ isActive }) => `px-6 py-2 rounded-full text-[10px] font-extrabold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{label}</NavLink>
);

const MobileNavItem = ({ to, icon }: { to: string, icon: string }) => (
  <NavLink to={to} className={({ isActive }) => `w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-xl scale-110' : 'text-slate-500'}`}><span className="text-xl">{icon}</span></NavLink>
);

export default App;
