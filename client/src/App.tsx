import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import CallRoundedIcon from '@mui/icons-material/CallRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import type { Customer, CustomerDraft } from './types.ts'

const AUTH_STORAGE_KEY = 'four-species-auth'
const TEMP_PASSCODE = '2468'
const configuredApiUrl = import.meta.env.VITE_API_URL
const API_BASE_URL = configuredApiUrl
  ? `${configuredApiUrl.startsWith('http') ? configuredApiUrl : `https://${configuredApiUrl}`}`.replace(
      /\/$/,
      '',
    ) + '/api'
  : 'http://localhost:3001/api'

type Screen =
  | 'login'
  | 'dashboard'
  | 'customers'
  | 'customer-new'
  | 'customer-details'
  | 'customer-edit'
  | 'reminders'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })
  const [screen, setScreen] = useState<Screen>(() => {
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ? 'dashboard' : 'login'
  })
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    fetch(`${API_BASE_URL}/customers`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('טעינת הלקוחות נכשלה')
        }

        return (await response.json()) as Customer[]
      })
      .then((loadedCustomers) => setCustomers(loadedCustomers))
      .catch(() => setCustomers([]))
  }, [isAuthenticated])

  const reminders = useMemo(() => {
    return [...customers]
      .filter((customer) => Boolean(customer.nextFollowUpAt))
      .sort((left, right) => left.nextFollowUpAt.localeCompare(right.nextFollowUpAt))
  }, [customers])

  const metrics = useMemo(() => {
    const returningCustomers = customers.filter((customer) => customer.isReturning).length
    const needsFollowUp = customers.filter((customer) => {
      if (!customer.nextFollowUpAt) {
        return false
      }

      return customer.nextFollowUpAt <= todayString()
    }).length

    return {
      total: customers.length,
      returningCustomers,
      needsFollowUp,
      recentUpdates: [...customers]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, 3),
    }
  }, [customers])

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null

  const handleLogin = (passcode: string) => {
    const isValid = passcode === TEMP_PASSCODE

    if (isValid) {
      setIsAuthenticated(true)
      setScreen('dashboard')
    }

    return isValid
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setScreen('login')
    setSelectedCustomerId(null)
  }

  const upsertCustomer = async (draft: CustomerDraft, customerId?: string) => {
    const payload = {
      ...draft,
      lastContactAt: draft.lastContactAt || null,
      nextFollowUpAt: draft.nextFollowUpAt || null,
    }
    const response = await fetch(
      customerId ? `${API_BASE_URL}/customers/${customerId}` : `${API_BASE_URL}/customers`,
      {
        method: customerId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error('שמירת הלקוח נכשלה')
    }

    const savedCustomer = (await response.json()) as Customer

    setCustomers((currentCustomers) => {
      if (customerId) {
        return currentCustomers.map((customer) =>
          customer.id === customerId ? savedCustomer : customer,
        )
      }

      return [savedCustomer, ...currentCustomers]
    })

    return savedCustomer.id
  }

  const openCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setScreen('customer-details')
  }

  const currentSection =
    screen === 'dashboard' ? 'dashboard' : screen === 'reminders' ? 'reminders' : 'customers'

  if (!isAuthenticated) {
    return <LoginPage isAuthenticated={isAuthenticated} onLogin={handleLogin} />
  }

  return (
    <AppShell currentSection={currentSection} onLogout={handleLogout} onNavigate={setScreen}>
      {screen === 'dashboard' ? (
        <DashboardPage metrics={metrics} onOpenCustomer={openCustomer} />
      ) : null}
      {screen === 'customers' ? (
        <CustomersPage
          customers={customers}
          onAddCustomer={() => setScreen('customer-new')}
          onOpenCustomer={openCustomer}
        />
      ) : null}
      {screen === 'customer-new' ? (
        <CustomerFormPage
          onCancel={() => setScreen('customers')}
          onSave={async (draft) => {
            const customerId = await upsertCustomer(draft)
            setSelectedCustomerId(customerId)
            setScreen('customer-details')
          }}
        />
      ) : null}
      {screen === 'customer-edit' ? (
        <CustomerFormPage
          customer={selectedCustomer}
          onCancel={() => setScreen(selectedCustomer ? 'customer-details' : 'customers')}
          onSave={async (draft) => {
            if (!selectedCustomer) {
              setScreen('customers')
              return
            }

            const customerId = await upsertCustomer(draft, selectedCustomer.id)
            setSelectedCustomerId(customerId)
            setScreen('customer-details')
          }}
        />
      ) : null}
      {screen === 'customer-details' ? (
        <CustomerDetailsPage
          customer={selectedCustomer}
          onBack={() => setScreen('customers')}
          onEdit={() => setScreen('customer-edit')}
        />
      ) : null}
      {screen === 'reminders' ? (
        <RemindersPage reminders={reminders} onOpenCustomer={openCustomer} />
      ) : null}
    </AppShell>
  )
}

function LoginPage({
  isAuthenticated,
  onLogin,
}: {
  isAuthenticated: boolean
  onLogin: (passcode: string) => boolean
}) {
  const [passcode, setPasscode] = useState('')
  const [hasError, setHasError] = useState(false)

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValid = onLogin(passcode)

    if (!isValid) {
      setHasError(true)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(180deg, rgba(249,248,242,0.96) 0%, rgba(255,255,255,0.98) 100%)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Chip label="מערכת פרטית" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                CRM ארבעת המינים
              </Typography>
              <Typography color="text.secondary">
                ממשק אישי לשמירת לקוחות, מעקבים והיסטוריה שנתית מהאייפון.
              </Typography>
            </Stack>
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              זהו מסך כניסה זמני לפרונט. קוד הפיתוח כרגע הוא {TEMP_PASSCODE}.
            </Alert>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  label="קוד כניסה"
                  type="password"
                  value={passcode}
                  onChange={(event) => {
                    setPasscode(event.target.value)
                    setHasError(false)
                  }}
                  error={hasError}
                  helperText={hasError ? 'הקוד שהוזן אינו נכון.' : 'שלב זמני עד חיבור NestJS.'}
                />
                <Button size="large" type="submit" variant="contained" fullWidth>
                  כניסה למערכת
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function AppShell({
  children,
  currentSection,
  onLogout,
  onNavigate,
}: {
  children: ReactNode
  currentSection: 'dashboard' | 'customers' | 'reminders'
  onLogout: () => void
  onNavigate: (screen: Screen) => void
}) {
  const navigationItems = [
    { label: 'דשבורד', screen: 'dashboard' as const, icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: 'לקוחות', screen: 'customers' as const, icon: <PersonRoundedIcon fontSize="small" /> },
    {
      label: 'מעקבים',
      screen: 'reminders' as const,
      icon: <CalendarMonthRoundedIcon fontSize="small" />,
    },
  ]

  return (
    <Box sx={{ minHeight: '100svh', pb: 'calc(92px + env(safe-area-inset-bottom))' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(251, 249, 244, 0.84)',
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>ד</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>ניהול לקוחות</Typography>
            <Typography variant="body2" color="text.secondary">
              פרטי, אישי, מותאם לאייפון
            </Typography>
          </Box>
          <IconButton color="inherit" aria-label="יציאה" onClick={onLogout}>
            <LogoutRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 2.5, px: 2 }}>
        {children}
      </Container>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          insetInline: 12,
          bottom: 'calc(12px + env(safe-area-inset-bottom))',
          borderRadius: 999,
          px: 1,
          py: 1,
          backgroundColor: 'rgba(21, 33, 21, 0.92)',
          color: 'common.white',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          {navigationItems.map((item) => {
            const isActive = currentSection === item.screen

            return (
              <Button
                key={item.screen}
                color="inherit"
                fullWidth
                startIcon={item.icon}
                onClick={() => onNavigate(item.screen)}
                sx={{
                  borderRadius: 999,
                  py: 1,
                  fontWeight: 700,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Paper>
    </Box>
  )
}

function DashboardPage({
  metrics,
  onOpenCustomer,
}: {
  metrics: {
    total: number
    returningCustomers: number
    needsFollowUp: number
    recentUpdates: Customer[]
  }
  onOpenCustomer: (customerId: string) => void
}) {
  const cards = [
    { label: 'סה"כ לקוחות', value: metrics.total, tone: 'primary.main' },
    { label: 'לקוחות חוזרים', value: metrics.returningCustomers, tone: 'secondary.main' },
    { label: 'דורשים מעקב', value: metrics.needsFollowUp, tone: 'warning.main' },
  ]

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'rgba(36, 73, 42, 0.14)',
          backgroundColor: 'rgba(255,255,255,0.55)',
        }}
      >
        {cards.map((card) => (
          <Box
            key={card.label}
            sx={{
              minWidth: 0,
              px: { xs: 1.25, sm: 2 },
              py: 1.75,
              borderInlineStart: '1px solid rgba(36, 73, 42, 0.14)',
              '&:first-of-type': { borderInlineStart: 'none' },
            }}
          >
            <Typography
              color="text.secondary"
              variant="caption"
              sx={{ display: 'block', minHeight: 34, lineHeight: 1.35, overflowWrap: 'anywhere' }}
            >
              {card.label}
            </Typography>
            <Typography variant="h4" sx={{ color: card.tone, mt: 0.5, fontWeight: 700 }}>
              {card.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                עודכנו לאחרונה
              </Typography>
              <Typography variant="body2" color="text.secondary">
                הפעילות האחרונה בכרטיס הלקוחות שלך
              </Typography>
            </Box>
            <Box
              sx={{
                width: 38,
                height: 38,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                borderRadius: 2.5,
                color: 'primary.main',
                backgroundColor: 'rgba(36, 73, 42, 0.1)',
              }}
            >
              <CalendarMonthRoundedIcon fontSize="small" />
            </Box>
          </Stack>
          <List disablePadding sx={{ display: 'grid', gap: 1.25 }}>
            {metrics.recentUpdates.map((customer) => (
              <ListItem key={customer.id} disablePadding>
                <ListItemButton
                  onClick={() => onOpenCustomer(customer.id)}
                  sx={{
                    minWidth: 0,
                    display: 'block',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'rgba(36, 73, 42, 0.12)',
                    borderRadius: 1.5,
                    backgroundColor: '#fcfdf9',
                    transition: 'border-color 0.2s, transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f4f8ef',
                      borderColor: 'primary.light',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack spacing={1} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                        {customer.name.slice(0, 1)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                          {customer.city}
                        </Typography>
                      </Box>
                      <Chip size="small" label="עודכן" variant="outlined" color="primary" />
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.75, sm: 2 }}
                      sx={{ color: 'text.secondary', pl: { xs: 0, sm: 5.5 } }}
                    >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <CallRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                          {customer.phone}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                          {formatDate(customer.updatedAt)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  )
}

function CustomersPage({
  customers,
  onAddCustomer,
  onOpenCustomer,
}: {
  customers: Customer[]
  onAddCustomer: () => void
  onOpenCustomer: (customerId: string) => void
}) {
  const [query, setQuery] = useState('')

  const filteredCustomers = customers.filter((customer) => {
    const matchesQuery =
      customer.name.includes(query) ||
      customer.phone.includes(query) ||
      customer.city.includes(query) ||
      customer.tags.some((tag) => tag.includes(query))

    return matchesQuery
  })

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חפש לפי שם, טלפון, עיר או תגית"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <CardActionArea onClick={() => onOpenCustomer(customer.id)}>
              <CardContent sx={{ p: { xs: 1.75, sm: 2 } }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{customer.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.city} • {customer.phone}
                      </Typography>
                    </Box>
                    <Chip size="small" label={customer.status} color={statusColor(customer.status)} />
                  </Stack>
                  <Typography variant="body2">{customer.productInterest}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {customer.isReturning ? <Chip size="small" label="לקוח חוזר" /> : null}
                    {customer.tags.map((tag) => (
                      <Chip key={tag} size="small" variant="outlined" label={tag} />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    מעקב הבא: {customer.nextFollowUpAt ? formatDate(customer.nextFollowUpAt) : 'לא נקבע'}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Fab
        color="primary"
        aria-label="הוספת לקוח"
        onClick={onAddCustomer}
        sx={{
          position: 'fixed',
          left: 20,
          bottom: 'calc(96px + env(safe-area-inset-bottom))',
        }}
      >
        <AddRoundedIcon />
      </Fab>
    </Stack>
  )
}

function CustomerFormPage({
  customer,
  onCancel,
  onSave,
}: {
  customer?: Customer | null
  onCancel: () => void
  onSave: (draft: CustomerDraft) => void
}) {
  const [draft, setDraft] = useState<CustomerDraft>(() => {
    if (customer) {
      return customerToDraft(customer)
    }

    return {
      name: '',
      phone: '',
      city: '',
      notes: '',
      productInterest: '',
      status: 'חדש',
      isReturning: false,
      lastContactAt: todayString(),
      nextFollowUpAt: '',
      tags: [],
    }
  })
  const [tagsInput, setTagsInput] = useState(customer?.tags.join(', ') ?? '')

  const handleChange = <Key extends keyof CustomerDraft>(field: Key, value: CustomerDraft[Key]) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      ...draft,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="שם הלקוח"
                value={draft.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
              />
              <TextField
                label="טלפון"
                value={draft.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                required
                inputMode="tel"
              />
              <TextField
                label="עיר"
                value={draft.city}
                onChange={(event) => handleChange('city', event.target.value)}
              />
              <TextField
                label="במה מתעניין / מה קנה"
                value={draft.productInterest}
                onChange={(event) => handleChange('productInterest', event.target.value)}
              />
              <TextField
                select
                label="סטטוס"
                value={draft.status}
                onChange={(event) => handleChange('status', event.target.value as Customer['status'])}
              >
                <MenuItem value="חדש">חדש</MenuItem>
                <MenuItem value="במעקב">במעקב</MenuItem>
                <MenuItem value="נסגר">נסגר</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.isReturning}
                    onChange={(event) => handleChange('isReturning', event.target.checked)}
                  />
                }
                label="לקוח חוזר"
              />
              <TextField
                label="תאריך קשר אחרון"
                type="date"
                value={draft.lastContactAt}
                onChange={(event) => handleChange('lastContactAt', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="תאריך מעקב הבא"
                type="date"
                value={draft.nextFollowUpAt}
                onChange={(event) => handleChange('nextFollowUpAt', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="תגיות"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                helperText="לדוגמה: VIP, ירושלים, סוכות"
              />
              <TextField
                label="הערות"
                value={draft.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                multiline
                minRows={4}
              />
              <Button type="submit" size="large" variant="contained">
                שמירת לקוח
              </Button>
              <Button type="button" size="large" variant="text" onClick={onCancel}>
                ביטול
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

function CustomerDetailsPage({
  customer,
  onBack,
  onEdit,
}: {
  customer: Customer | null
  onBack: () => void
  onEdit: () => void
}) {
  if (!customer) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 4 }}>
        הלקוח המבוקש לא נמצא.
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2}>
            <Button variant="text" onClick={onBack} sx={{ alignSelf: 'flex-start' }}>
              חזרה לרשימת לקוחות
            </Button>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {customer.name}
                </Typography>
                <Typography color="text.secondary">{customer.city}</Typography>
              </Box>
              <Chip label={customer.status} color={statusColor(customer.status)} />
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {customer.isReturning ? <Chip label="לקוח חוזר" /> : null}
              {customer.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CallRoundedIcon />}
                component="a"
                href={`tel:${customer.phone}`}
              >
                התקשרות
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                component="a"
                href={`https://wa.me/972${normalizeIsraeliPhone(customer.phone)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </Button>
            </Stack>
            <Button variant="text" onClick={onEdit}>
              עריכת פרטי לקוח
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <InfoCard title="פרטים חשובים">
        <InfoRow label="טלפון" value={customer.phone} />
        <InfoRow label="מעקב הבא" value={customer.nextFollowUpAt ? formatDate(customer.nextFollowUpAt) : 'לא נקבע'} />
        <InfoRow label="קשר אחרון" value={formatDate(customer.lastContactAt)} />
        <InfoRow label="עניין / רכישה" value={customer.productInterest || 'לא הוזן'} />
      </InfoCard>

      <InfoCard title="הערות">
        <Typography>{customer.notes || 'אין הערות כרגע.'}</Typography>
      </InfoCard>
    </Stack>
  )
}

function RemindersPage({
  reminders,
  onOpenCustomer,
}: {
  reminders: Customer[]
  onOpenCustomer: (customerId: string) => void
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          מעקבים קרובים
        </Typography>
        <Typography color="text.secondary">רשימת הלקוחות שצריך לחזור אליהם בזמן.</Typography>
      </Box>

      <Stack spacing={1.5}>
        {reminders.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 4 }}>
            עדיין לא נוספו מעקבים.
          </Alert>
        ) : null}
        {reminders.map((customer) => (
          <Card key={customer.id} elevation={0} sx={{ borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
            <CardActionArea onClick={() => onOpenCustomer(customer.id)}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{customer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer.productInterest || customer.city}
                    </Typography>
                  </Box>
                  <Chip color="warning" label={formatDate(customer.nextFollowUpAt)} />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Stack spacing={1} divider={<Divider flexItem />}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline', py: 0.5 }}>
      <Typography color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography sx={{ textAlign: 'left', overflowWrap: 'anywhere' }}>{value}</Typography>
    </Stack>
  )
}

function customerToDraft(customer: Customer): CustomerDraft {
  return {
    name: customer.name,
    phone: customer.phone,
    city: customer.city,
    notes: customer.notes,
    productInterest: customer.productInterest,
    status: customer.status,
    isReturning: customer.isReturning,
    lastContactAt: customer.lastContactAt,
    nextFollowUpAt: customer.nextFollowUpAt,
    tags: customer.tags,
  }
}

function statusColor(status: Customer['status']): 'default' | 'primary' | 'secondary' | 'success' | 'warning' {
  if (status === 'חדש') {
    return 'primary'
  }

  if (status === 'במעקב') {
    return 'warning'
  }

  return 'success'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeIsraeliPhone(phone: string) {
  return phone.replace(/\D/g, '').replace(/^0/, '')
}

export default App
