<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAdminStore } from "./stores/admin";

const store = useAdminStore();
const activeSection = ref("overview");
const showDialog = ref(false);
const dialogKind = ref("");
const editingId = ref("");
const loginForm = reactive({
  username: "admin",
  password: "admin123",
});
const entityForm = reactive<Record<string, any>>({});

const menuItems = [
  ["overview", "概览"],
  ["banners", "轮播"],
  ["schools", "学校"],
  ["categories", "分类"],
  ["games", "桌游"],
  ["orders", "订单"],
  ["users", "用户"],
  ["coupons", "营销"],
  ["reports", "报表"],
  ["settings", "设置"],
];

const activeRows = computed(() => {
  switch (activeSection.value) {
    case "banners":
      return store.banners;
    case "schools":
      return store.schools;
    case "categories":
      return store.categories;
    case "games":
      return store.games;
    case "coupons":
      return store.coupons;
    default:
      return [];
  }
});

const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "上架", value: "published" },
  { label: "下架", value: "offline" },
];

onMounted(async () => {
  if (store.token) {
    try {
      await store.fetchBootstrap();
    } catch {
      store.logout();
    }
  }
});

function resetEntityForm(kind: string, item?: any) {
  dialogKind.value = kind;
  editingId.value = item?.id || "";
  const defaults: Record<string, any> = {
    banners: { title: "", subtitle: "", image: "", sort: 1, enabled: true },
    schools: { name: "", campus: "上海大学城", isActive: true, deliveryTips: "" },
    categories: { name: "", description: "", sort: 1, icon: "sparkles" },
    games: {
      name: "",
      coverImage: "",
      galleryText: "",
      tagsText: "",
      categoryId: store.categories[0]?.id || "",
      dailyPrice: 18,
      deposit: 50,
      stock: 1,
      description: "",
      players: "4-6 人",
      duration: "30-60 分钟",
      status: "published",
      featured: false,
    },
    coupons: { name: "", code: "", amount: 10, minAmount: 50, enabled: true },
  };
  Object.keys(entityForm).forEach((key) => delete entityForm[key]);
  Object.assign(entityForm, defaults[kind], item || {});
  if (kind === "games" && item) {
    entityForm.galleryText = (item.gallery || []).join("\n");
    entityForm.tagsText = (item.tags || []).join("，");
  }
  showDialog.value = true;
}

async function handleLogin() {
  try {
    await store.login(loginForm.username, loginForm.password);
    ElMessage.success("后台登录成功");
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "登录失败");
  }
}

async function submitEntity() {
  try {
    const kind = dialogKind.value;
    const payload = { ...entityForm };
    if (kind === "games") {
      payload.gallery = String(entityForm.galleryText || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      payload.tags = String(entityForm.tagsText || "")
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);
      delete payload.galleryText;
      delete payload.tagsText;
    }
    await store.saveEntity(kind, payload, editingId.value || undefined);
    showDialog.value = false;
    ElMessage.success("保存成功");
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "保存失败");
  }
}

async function removeEntity(kind: string, id: string) {
  await store.deleteEntity(kind, id);
  ElMessage.success("删除成功");
}

async function updateOrder(id: string, payload: any) {
  await store.updateOrderStatus(id, payload);
  ElMessage.success("订单已更新");
}

async function saveSettings() {
  await store.updateSettings(store.settings);
  ElMessage.success("设置已更新");
}

function prettyMoney(value: number) {
  return `¥${Number(value || 0).toFixed(2)}`;
}
</script>

<template>
  <div v-if="!store.token" class="login-shell">
    <div class="login-card glass-panel">
      <div class="hero-copy">
        <p class="eyebrow">Campus Boardgame Studio</p>
        <h1>大学城桌游租赁后台</h1>
        <p class="subcopy">
          蓝绿青春风运营台，支持轮播、桌游、订单、学校、优惠券和接单配置一体管理。
        </p>
      </div>
      <el-form label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="管理员账号">
          <el-input v-model="loginForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            type="password"
          />
        </el-form-item>
        <el-button
          :loading="store.loading"
          class="login-button"
          type="primary"
          @click="handleLogin"
        >
          登录后台
        </el-button>
      </el-form>
    </div>
  </div>

  <div v-else class="dashboard-shell">
    <aside class="sidebar glass-panel">
      <div class="brand">
        <div class="brand-badge">BG</div>
        <div>
          <strong>桌游大学城</strong>
          <p>青春蓝绿运营台</p>
        </div>
      </div>
      <button
        v-for="[key, label] in menuItems"
        :key="key"
        :class="['nav-item', { active: activeSection === key }]"
        @click="activeSection = key"
      >
        {{ label }}
      </button>
      <el-button plain @click="store.logout">退出登录</el-button>
    </aside>

    <main class="content">
      <header class="topbar glass-panel">
        <div>
          <h2>{{ menuItems.find(([key]) => key === activeSection)?.[1] }}</h2>
          <p>欢迎回来，{{ store.admin?.name || "运营官" }}</p>
        </div>
        <div class="topbar-chip">模拟支付与自动接单均可配置</div>
      </header>

      <section v-if="activeSection === 'overview'" class="section-grid">
        <div class="stat-card glass-panel">
          <span>桌游总数</span>
          <strong>{{ store.dashboard?.overview?.totalGames || 0 }}</strong>
        </div>
        <div class="stat-card glass-panel">
          <span>用户总数</span>
          <strong>{{ store.dashboard?.overview?.totalUsers || 0 }}</strong>
        </div>
        <div class="stat-card glass-panel">
          <span>订单总数</span>
          <strong>{{ store.dashboard?.overview?.totalOrders || 0 }}</strong>
        </div>
        <div class="stat-card glass-panel">
          <span>已支付营收</span>
          <strong>{{ prettyMoney(store.dashboard?.overview?.paidRevenue || 0) }}</strong>
        </div>
        <div class="panel-wide glass-panel">
          <div class="panel-header">
            <h3>最新订单</h3>
          </div>
          <el-table :data="store.dashboard?.latestOrders || []">
            <el-table-column label="订单号" prop="orderNo" min-width="140" />
            <el-table-column label="桌游" min-width="120">
              <template #default="{ row }">{{ row.items?.[0]?.name }}</template>
            </el-table-column>
            <el-table-column label="学校" prop="schoolName" min-width="160" />
            <el-table-column label="金额" min-width="90">
              <template #default="{ row }">{{ prettyMoney(row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column label="支付" prop="paymentStatus" min-width="90" />
          </el-table>
        </div>
      </section>

      <section
        v-else-if="['banners', 'schools', 'categories', 'games', 'coupons'].includes(activeSection)"
        class="panel-wide glass-panel"
      >
        <div class="panel-header">
          <h3>{{ menuItems.find(([key]) => key === activeSection)?.[1] }}管理</h3>
          <el-button type="primary" @click="resetEntityForm(activeSection)">新增</el-button>
        </div>
        <el-table :data="activeRows" stripe>
          <el-table-column label="名称" min-width="160">
            <template #default="{ row }">
              {{ row.name || row.title }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="activeSection !== 'categories'"
            label="状态/说明"
            min-width="180"
          >
            <template #default="{ row }">
              {{
                row.status ||
                row.subtitle ||
                row.deliveryTips ||
                `${prettyMoney(row.amount)} / 满${prettyMoney(row.minAmount)}`
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="resetEntityForm(activeSection, row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="removeEntity(activeSection, row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-else-if="activeSection === 'orders'" class="panel-wide glass-panel">
        <div class="panel-header">
          <h3>订单管理</h3>
        </div>
        <el-table :data="store.orders" stripe>
          <el-table-column label="订单号" prop="orderNo" min-width="150" />
          <el-table-column label="桌游" min-width="120">
            <template #default="{ row }">{{ row.items?.[0]?.name }}</template>
          </el-table-column>
          <el-table-column label="学校" prop="schoolName" min-width="160" />
          <el-table-column label="金额" min-width="90">
            <template #default="{ row }">{{ prettyMoney(row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column label="支付状态" prop="paymentStatus" min-width="90" />
          <el-table-column label="接单状态" prop="acceptStatus" min-width="90" />
          <el-table-column label="配送状态" prop="deliveryStatus" min-width="90" />
          <el-table-column label="快捷操作" width="220">
            <template #default="{ row }">
              <el-button link type="primary" @click="updateOrder(row.id, { acceptStatus: 'confirmed' })">
                接单
              </el-button>
              <el-button
                link
                type="success"
                @click="updateOrder(row.id, { deliveryStatus: 'delivered' })"
              >
                送达
              </el-button>
              <el-button
                link
                type="warning"
                @click="updateOrder(row.id, { paymentStatus: 'paid' })"
              >
                标记已付
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-else-if="activeSection === 'users'" class="panel-wide glass-panel">
        <div class="panel-header">
          <h3>用户管理</h3>
        </div>
        <el-table :data="store.users" stripe>
          <el-table-column label="昵称" prop="nickname" min-width="140" />
          <el-table-column label="OpenID" prop="openId" min-width="180" />
          <el-table-column label="最近联系人" prop="recentContactName" min-width="120" />
          <el-table-column label="最近电话" prop="recentContactPhone" min-width="120" />
          <el-table-column label="注册时间" prop="createdAt" min-width="180" />
        </el-table>
      </section>

      <section v-else-if="activeSection === 'reports'" class="section-grid">
        <div class="stat-card glass-panel">
          <span>今日订单</span>
          <strong>{{ store.reports?.todayOrders || 0 }}</strong>
        </div>
        <div class="stat-card glass-panel">
          <span>累计营收</span>
          <strong>{{ prettyMoney(store.reports?.totalRevenue || 0) }}</strong>
        </div>
        <div class="panel-wide glass-panel">
          <div class="panel-header">
            <h3>学校订单分布</h3>
          </div>
          <el-table :data="store.reports?.schoolStats || []">
            <el-table-column label="学校" prop="schoolName" min-width="180" />
            <el-table-column label="订单量" prop="orderCount" min-width="120" />
          </el-table>
        </div>
        <div class="panel-wide glass-panel">
          <div class="panel-header">
            <h3>桌游租赁热度</h3>
          </div>
          <el-table :data="store.reports?.gameStats || []">
            <el-table-column label="桌游" prop="gameName" min-width="180" />
            <el-table-column label="订单量" prop="orderCount" min-width="120" />
          </el-table>
        </div>
      </section>

      <section v-else-if="activeSection === 'settings'" class="panel-wide glass-panel settings-panel">
        <div class="panel-header">
          <h3>系统设置</h3>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </div>
        <div class="setting-row">
          <span>接单模式</span>
          <el-radio-group v-model="store.settings.orderAcceptMode">
            <el-radio-button label="manual">手动接单</el-radio-button>
            <el-radio-button label="auto">自动接单</el-radio-button>
          </el-radio-group>
        </div>
        <div class="setting-row">
          <span>支付模式</span>
          <el-radio-group v-model="store.settings.paymentMode">
            <el-radio-button label="mock">模拟支付</el-radio-button>
            <el-radio-button label="wechat">微信支付预留</el-radio-button>
          </el-radio-group>
        </div>
        <div class="setting-row">
          <span>小程序隐藏管理员入口</span>
          <el-switch v-model="store.settings.miniAdminEnabled" />
        </div>
      </section>
    </main>
  </div>

  <el-dialog v-model="showDialog" :title="editingId ? '编辑内容' : '新增内容'" width="640px">
    <el-form label-position="top">
      <template v-if="dialogKind === 'banners'">
        <el-form-item label="标题"><el-input v-model="entityForm.title" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="entityForm.subtitle" /></el-form-item>
        <el-form-item label="图片地址"><el-input v-model="entityForm.image" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="entityForm.sort" :min="1" /></el-form-item>
        <el-switch v-model="entityForm.enabled" active-text="启用" />
      </template>
      <template v-else-if="dialogKind === 'schools'">
        <el-form-item label="学校名称"><el-input v-model="entityForm.name" /></el-form-item>
        <el-form-item label="所属大学城"><el-input v-model="entityForm.campus" /></el-form-item>
        <el-form-item label="配送说明"><el-input v-model="entityForm.deliveryTips" /></el-form-item>
        <el-switch v-model="entityForm.isActive" active-text="启用配送" />
      </template>
      <template v-else-if="dialogKind === 'categories'">
        <el-form-item label="分类名称"><el-input v-model="entityForm.name" /></el-form-item>
        <el-form-item label="分类描述"><el-input v-model="entityForm.description" /></el-form-item>
        <el-form-item label="图标标识"><el-input v-model="entityForm.icon" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="entityForm.sort" :min="1" /></el-form-item>
      </template>
      <template v-else-if="dialogKind === 'games'">
        <el-form-item label="桌游名称"><el-input v-model="entityForm.name" /></el-form-item>
        <el-form-item label="封面图"><el-input v-model="entityForm.coverImage" /></el-form-item>
        <el-form-item label="轮播图地址（每行一张）">
          <el-input v-model="entityForm.galleryText" :rows="3" type="textarea" />
        </el-form-item>
        <el-form-item label="标签（用逗号分隔）">
          <el-input v-model="entityForm.tagsText" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="entityForm.categoryId">
            <el-option
              v-for="category in store.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <div class="triple-grid">
          <el-form-item label="日租金"><el-input-number v-model="entityForm.dailyPrice" :min="0" /></el-form-item>
          <el-form-item label="押金"><el-input-number v-model="entityForm.deposit" :min="0" /></el-form-item>
          <el-form-item label="库存"><el-input-number v-model="entityForm.stock" :min="0" /></el-form-item>
        </div>
        <div class="double-grid">
          <el-form-item label="适合人数"><el-input v-model="entityForm.players" /></el-form-item>
          <el-form-item label="局时长"><el-input v-model="entityForm.duration" /></el-form-item>
        </div>
        <el-form-item label="桌游描述">
          <el-input v-model="entityForm.description" :rows="4" type="textarea" />
        </el-form-item>
        <div class="double-grid">
          <el-form-item label="状态">
            <el-select v-model="entityForm.status">
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="首页推荐">
            <el-switch v-model="entityForm.featured" active-text="推荐" />
          </el-form-item>
        </div>
      </template>
      <template v-else-if="dialogKind === 'coupons'">
        <el-form-item label="优惠券名称"><el-input v-model="entityForm.name" /></el-form-item>
        <el-form-item label="兑换码"><el-input v-model="entityForm.code" /></el-form-item>
        <div class="double-grid">
          <el-form-item label="优惠金额"><el-input-number v-model="entityForm.amount" :min="0" /></el-form-item>
          <el-form-item label="最低门槛"><el-input-number v-model="entityForm.minAmount" :min="0" /></el-form-item>
        </div>
        <el-switch v-model="entityForm.enabled" active-text="启用" />
      </template>
    </el-form>
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="submitEntity">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.login-card {
  width: min(900px, 100%);
  border-radius: 36px;
  padding: 36px;
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 32px;
}

.hero-copy {
  background: linear-gradient(135deg, rgba(43, 130, 201, 0.9), rgba(21, 157, 138, 0.92));
  color: white;
  border-radius: 28px;
  padding: 32px;
}

.eyebrow {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
}

.subcopy {
  font-size: 16px;
  line-height: 1.75;
  opacity: 0.94;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  border: none;
}

.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  padding: 18px;
}

.sidebar {
  border-radius: 32px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.brand p {
  margin: 4px 0 0;
  color: var(--muted);
}

.brand-badge {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 800;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.nav-item {
  border: none;
  background: rgba(255, 255, 255, 0.52);
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  font-size: 15px;
  color: var(--text);
  cursor: pointer;
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.topbar,
.panel-wide,
.stat-card {
  border-radius: 28px;
}

.topbar {
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar h2,
.panel-header h3 {
  margin: 0;
}

.topbar p {
  margin: 6px 0 0;
  color: var(--muted);
}

.topbar-chip {
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(21, 157, 138, 0.1);
  color: var(--primary);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  min-height: 146px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card span {
  color: var(--muted);
}

.stat-card strong {
  font-size: 34px;
}

.panel-wide {
  padding: 22px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
}

.double-grid,
.triple-grid {
  display: grid;
  gap: 16px;
}

.double-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.triple-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1100px) {
  .dashboard-shell,
  .login-card,
  .section-grid {
    grid-template-columns: 1fr;
  }
}
</style>
