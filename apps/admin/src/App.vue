<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAdminStore } from "./stores/admin";
import { apiUploadImage } from "./api/client";

const store = useAdminStore();
const activeSection = ref("overview");
const showDialog = ref(false);
const dialogKind = ref("");
const editingId = ref("");
const uploadingKey = ref("");

const loginForm = reactive({
  username: "admin",
  password: "admin123",
});

const entityForm = reactive<Record<string, any>>({});

const menuItems = [
  { key: "overview", label: "总览驾驶舱", desc: "看板与重点提醒" },
  { key: "banners", label: "轮播管理", desc: "首页视觉配置" },
  { key: "schools", label: "学校管理", desc: "大学城配送范围" },
  { key: "categories", label: "分类管理", desc: "桌游菜单结构" },
  { key: "games", label: "桌游商品", desc: "价格库存上下架" },
  { key: "orders", label: "订单管理", desc: "接单配送与支付" },
  { key: "users", label: "用户管理", desc: "用户信息与偏好" },
  { key: "coupons", label: "营销优惠", desc: "优惠券与活动" },
  { key: "reports", label: "经营报表", desc: "营收趋势与排行" },
  { key: "settings", label: "系统设置", desc: "接单支付配置" },
];

const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "上架", value: "published" },
  { label: "下架", value: "offline" },
];

const sectionMeta = computed(
  () => menuItems.find((item) => item.key === activeSection.value) ?? menuItems[0],
);

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

const overviewCards = computed(() => [
  {
    label: "桌游总数",
    value: store.dashboard?.overview?.totalGames || 0,
    note: "已纳入后台商品池",
    tone: "blue",
  },
  {
    label: "累计用户",
    value: store.dashboard?.overview?.totalUsers || 0,
    note: "最近进入小程序用户",
    tone: "green",
  },
  {
    label: "订单总数",
    value: store.dashboard?.overview?.totalOrders || 0,
    note: "含待确认与已完成",
    tone: "mint",
  },
  {
    label: "已支付营收",
    value: prettyMoney(store.dashboard?.overview?.paidRevenue || 0),
    note: "当前已付款订单金额",
    tone: "gold",
  },
]);

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
    banners: {
      title: "",
      subtitle: "",
      image: "",
      sort: 1,
      enabled: true,
    },
    schools: {
      name: "",
      campus: "上海大学城",
      isActive: true,
      deliveryTips: "",
    },
    categories: {
      name: "",
      description: "",
      sort: 1,
      icon: "sparkles",
    },
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
    coupons: {
      name: "",
      code: "",
      amount: 10,
      minAmount: 50,
      enabled: true,
    },
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
  ElMessage.success("系统设置已保存");
}

function prettyMoney(value: number) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function pickFiles(multiple = false) {
  return new Promise<File[]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = multiple;
    input.onchange = () => {
      resolve(Array.from(input.files || []));
    };
    input.click();
  });
}

async function uploadSingleImage(field: string, key: string) {
  const files = await pickFiles(false);
  if (!files.length) return;
  try {
    uploadingKey.value = key;
    const result = await apiUploadImage(files[0]);
    entityForm[field] = result.url;
    ElMessage.success("图片上传成功");
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "图片上传失败");
  } finally {
    uploadingKey.value = "";
  }
}

async function uploadGalleryImages() {
  const files = await pickFiles(true);
  if (!files.length) return;
  try {
    uploadingKey.value = "game-gallery";
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const result = await apiUploadImage(file);
      uploadedUrls.push(result.url);
    }
    const currentUrls = String(entityForm.galleryText || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    entityForm.galleryText = [...currentUrls, ...uploadedUrls].join("\n");
    ElMessage.success("详情图上传成功");
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || "详情图上传失败");
  } finally {
    uploadingKey.value = "";
  }
}

function galleryPreviewList() {
  return String(entityForm.galleryText || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
</script>

<template>
  <div v-if="!store.token" class="login-shell">
    <div class="login-card glass-panel">
      <div class="hero-copy">
        <div class="hero-chip">Campus Boardgame Admin</div>
        <h1>云小夏桌游租赁后台</h1>
        <p class="subcopy">
          用一套后台管理大学城桌游租赁业务：商品、轮播、订单、用户、营销和系统配置都集中在这里。
        </p>
        <div class="hero-points">
          <span>蓝绿青春风</span>
          <span>前后端分离</span>
          <span>模拟支付预留</span>
        </div>
      </div>

      <div class="login-form-shell">
        <div class="login-form-head">
          <h2>管理员登录</h2>
          <p>使用后台账号进入运营控制台</p>
        </div>

        <el-form label-position="top" @submit.prevent="handleLogin">
          <el-form-item label="管理员账号">
            <el-input v-model="loginForm.username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
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
  </div>

  <div v-else class="dashboard-shell">
    <aside class="sidebar glass-panel">
      <div class="brand">
        <div class="brand-badge">YX</div>
        <div>
          <strong>云小夏桌游租赁</strong>
          <p>校园运营控制台</p>
        </div>
      </div>

      <div class="sidebar-caption">功能导航</div>
      <button
        v-for="item in menuItems"
        :key="item.key"
        :class="['nav-item', { active: activeSection === item.key }]"
        @click="activeSection = item.key"
      >
        <span class="nav-label">{{ item.label }}</span>
        <span class="nav-desc">{{ item.desc }}</span>
      </button>

      <div class="sidebar-footer">
        <div class="sidebar-status">
          <span class="dot"></span>
          <span>本地服务运行中</span>
        </div>
        <el-button plain @click="store.logout">退出登录</el-button>
      </div>
    </aside>

    <main class="content">
      <header class="topbar glass-panel">
        <div>
          <h2>{{ sectionMeta.label }}</h2>
          <p>{{ sectionMeta.desc }} · 欢迎回来，{{ store.admin?.name || "运营官" }}</p>
        </div>
        <div class="topbar-chip">订单接单、支付模式和小程序入口均可后台配置</div>
      </header>

      <section v-if="activeSection === 'overview'" class="overview-layout">
        <div class="overview-grid">
          <div
            v-for="card in overviewCards"
            :key="card.label"
            :class="['stat-card', 'glass-panel', `tone-${card.tone}`]"
          >
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
            <p>{{ card.note }}</p>
          </div>
        </div>

        <div class="overview-panels">
          <section class="panel-wide glass-panel">
            <div class="panel-header">
              <h3>最新订单</h3>
              <span>最近进入系统的业务流</span>
            </div>
            <el-table :data="store.dashboard?.latestOrders || []" stripe>
              <el-table-column label="订单号" prop="orderNo" min-width="140" />
              <el-table-column label="桌游" min-width="120">
                <template #default="{ row }">{{ row.items?.[0]?.name }}</template>
              </el-table-column>
              <el-table-column label="学校" prop="schoolName" min-width="160" />
              <el-table-column label="金额" min-width="90">
                <template #default="{ row }">{{ prettyMoney(row.totalAmount) }}</template>
              </el-table-column>
              <el-table-column label="支付状态" prop="paymentStatus" min-width="100" />
            </el-table>
          </section>

          <section class="panel-side glass-panel">
            <div class="panel-header">
              <h3>当前配置</h3>
              <span>关键业务开关</span>
            </div>
            <div class="meta-card">
              <label>接单模式</label>
              <strong>{{ store.settings.orderAcceptMode === "auto" ? "自动接单" : "手动接单" }}</strong>
            </div>
            <div class="meta-card">
              <label>支付模式</label>
              <strong>{{ store.settings.paymentMode === "wechat" ? "微信支付预留" : "模拟支付" }}</strong>
            </div>
            <div class="meta-card">
              <label>小程序管理入口</label>
              <strong>{{ store.settings.miniAdminEnabled ? "已开启" : "已关闭" }}</strong>
            </div>
          </section>
        </div>
      </section>

      <section
        v-else-if="['banners', 'schools', 'categories', 'games', 'coupons'].includes(activeSection)"
        class="panel-wide glass-panel"
      >
        <div class="panel-header">
          <div>
            <h3>{{ sectionMeta.label }}</h3>
            <span>支持新增、编辑和删除</span>
          </div>
          <el-button type="primary" @click="resetEntityForm(activeSection)">新增内容</el-button>
        </div>

        <el-table :data="activeRows" stripe>
          <el-table-column label="名称" min-width="180">
            <template #default="{ row }">{{ row.name || row.title }}</template>
          </el-table-column>
          <el-table-column
            v-if="activeSection !== 'categories'"
            label="状态 / 说明"
            min-width="220"
          >
            <template #default="{ row }">
              {{
                row.status ||
                row.subtitle ||
                row.deliveryTips ||
                `${prettyMoney(row.amount)} / 满 ${prettyMoney(row.minAmount)}`
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220">
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
          <div>
            <h3>订单管理</h3>
            <span>高频处理接单、配送和支付状态</span>
          </div>
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
          <el-table-column label="支付状态" prop="paymentStatus" min-width="100" />
          <el-table-column label="接单状态" prop="acceptStatus" min-width="100" />
          <el-table-column label="配送状态" prop="deliveryStatus" min-width="100" />
          <el-table-column label="快捷操作" width="220">
            <template #default="{ row }">
              <el-button link type="primary" @click="updateOrder(row.id, { acceptStatus: 'confirmed' })">
                接单
              </el-button>
              <el-button link type="success" @click="updateOrder(row.id, { deliveryStatus: 'delivered' })">
                送达
              </el-button>
              <el-button link type="warning" @click="updateOrder(row.id, { paymentStatus: 'paid' })">
                标记已付
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-else-if="activeSection === 'users'" class="panel-wide glass-panel">
        <div class="panel-header">
          <div>
            <h3>用户管理</h3>
            <span>查看用户身份和最近联系信息</span>
          </div>
        </div>

        <el-table :data="store.users" stripe>
          <el-table-column label="昵称" prop="nickname" min-width="140" />
          <el-table-column label="OpenID" prop="openId" min-width="180" />
          <el-table-column label="最近联系人" prop="recentContactName" min-width="120" />
          <el-table-column label="最近电话" prop="recentContactPhone" min-width="120" />
          <el-table-column label="注册时间" prop="createdAt" min-width="180" />
        </el-table>
      </section>

      <section v-else-if="activeSection === 'reports'" class="overview-layout">
        <div class="overview-grid">
          <div class="stat-card glass-panel tone-blue">
            <span>今日订单</span>
            <strong>{{ store.reports?.todayOrders || 0 }}</strong>
            <p>当天新增订单总量</p>
          </div>
          <div class="stat-card glass-panel tone-gold">
            <span>累计营收</span>
            <strong>{{ prettyMoney(store.reports?.totalRevenue || 0) }}</strong>
            <p>所有已支付订单金额汇总</p>
          </div>
        </div>

        <div class="overview-panels stacked">
          <section class="panel-wide glass-panel">
            <div class="panel-header">
              <h3>学校订单分布</h3>
            </div>
            <el-table :data="store.reports?.schoolStats || []">
              <el-table-column label="学校" prop="schoolName" min-width="180" />
              <el-table-column label="订单量" prop="orderCount" min-width="120" />
            </el-table>
          </section>

          <section class="panel-wide glass-panel">
            <div class="panel-header">
              <h3>桌游租赁热度</h3>
            </div>
            <el-table :data="store.reports?.gameStats || []">
              <el-table-column label="桌游" prop="gameName" min-width="180" />
              <el-table-column label="订单量" prop="orderCount" min-width="120" />
            </el-table>
          </section>
        </div>
      </section>

      <section v-else-if="activeSection === 'settings'" class="panel-wide glass-panel settings-panel">
        <div class="panel-header">
          <div>
            <h3>系统设置</h3>
            <span>配置接单模式、支付模式和管理员入口</span>
          </div>
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

  <el-dialog
    v-model="showDialog"
    :title="editingId ? '编辑内容' : '新增内容'"
    width="640px"
  >
    <el-form label-position="top">
      <template v-if="dialogKind === 'banners'">
        <el-form-item label="标题"><el-input v-model="entityForm.title" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="entityForm.subtitle" /></el-form-item>
        <el-form-item label="图片地址">
          <div class="upload-field">
            <el-input v-model="entityForm.image" placeholder="上传后自动回填图片地址" />
            <el-button
              :loading="uploadingKey === 'banner-image'"
              type="primary"
              plain
              @click="uploadSingleImage('image', 'banner-image')"
            >
              上传图片
            </el-button>
          </div>
          <img v-if="entityForm.image" :src="entityForm.image" class="image-preview" />
        </el-form-item>
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
        <el-form-item label="封面图">
          <div class="upload-field">
            <el-input v-model="entityForm.coverImage" placeholder="上传后自动回填封面图地址" />
            <el-button
              :loading="uploadingKey === 'game-cover'"
              type="primary"
              plain
              @click="uploadSingleImage('coverImage', 'game-cover')"
            >
              上传封面
            </el-button>
          </div>
          <img v-if="entityForm.coverImage" :src="entityForm.coverImage" class="image-preview" />
        </el-form-item>
        <el-form-item label="轮播图地址（每行一张）">
          <div class="upload-stack">
            <div class="upload-field">
              <el-input
                v-model="entityForm.galleryText"
                :rows="3"
                type="textarea"
                placeholder="可直接上传多张详情图，系统会自动填写"
              />
              <el-button
                :loading="uploadingKey === 'game-gallery'"
                type="primary"
                plain
                @click="uploadGalleryImages"
              >
                上传详情图
              </el-button>
            </div>
            <div v-if="galleryPreviewList().length" class="preview-grid">
              <img
                v-for="url in galleryPreviewList()"
                :key="url"
                :src="url"
                class="gallery-preview"
              />
            </div>
          </div>
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
          <el-form-item label="日租金">
            <el-input-number v-model="entityForm.dailyPrice" :min="0" />
          </el-form-item>
          <el-form-item label="押金">
            <el-input-number v-model="entityForm.deposit" :min="0" />
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number v-model="entityForm.stock" :min="0" />
          </el-form-item>
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
          <el-form-item label="优惠金额">
            <el-input-number v-model="entityForm.amount" :min="0" />
          </el-form-item>
          <el-form-item label="最低门槛">
            <el-input-number v-model="entityForm.minAmount" :min="0" />
          </el-form-item>
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
  width: min(1080px, 100%);
  border-radius: 38px;
  padding: 26px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
}

.hero-copy {
  border-radius: 28px;
  padding: 38px;
  color: white;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 22%),
    linear-gradient(135deg, rgba(43, 130, 201, 0.98), rgba(21, 157, 138, 0.94));
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-chip {
  display: inline-flex;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 18px 0 12px;
  font-size: 44px;
  line-height: 1.15;
}

.subcopy {
  margin: 0;
  font-size: 16px;
  line-height: 1.8;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.92);
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.hero-points span {
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.login-form-shell {
  border-radius: 28px;
  padding: 34px 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(21, 157, 138, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form-head h2 {
  margin: 0;
  font-size: 28px;
}

.login-form-head p {
  margin: 10px 0 28px;
  color: var(--muted);
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 296px 1fr;
  gap: 18px;
  padding: 18px;
}

.sidebar {
  border-radius: 32px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.brand p {
  margin: 4px 0 0;
  color: var(--muted);
}

.brand-badge {
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.sidebar-caption {
  margin: 10px 2px 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.nav-item {
  border: none;
  background: rgba(255, 255, 255, 0.54);
  border-radius: 18px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text);
  transition: transform 0.2s ease, background 0.2s ease;
}

.nav-item:hover {
  transform: translateY(-1px);
}

.nav-item.active {
  color: white;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.nav-label {
  font-size: 15px;
  font-weight: 700;
}

.nav-desc {
  font-size: 12px;
  opacity: 0.78;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #20c997;
  box-shadow: 0 0 0 5px rgba(32, 201, 151, 0.14);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.topbar,
.panel-wide,
.panel-side,
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
  margin: 8px 0 0;
  color: var(--muted);
}

.topbar-chip {
  max-width: 320px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(21, 157, 138, 0.1);
  color: var(--primary);
  font-size: 13px;
  line-height: 1.5;
}

.overview-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.overview-panels {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.7fr);
  gap: 18px;
}

.overview-panels.stacked {
  grid-template-columns: 1fr;
}

.stat-card {
  min-height: 156px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: -40px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.12;
  background: currentColor;
}

.stat-card span,
.stat-card p {
  position: relative;
  z-index: 1;
}

.stat-card span {
  color: var(--muted);
  font-size: 14px;
}

.stat-card strong {
  position: relative;
  z-index: 1;
  font-size: 36px;
  line-height: 1.1;
}

.stat-card p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.tone-blue {
  color: #2b82c9;
}

.tone-green {
  color: #159d8a;
}

.tone-mint {
  color: #34c0a6;
}

.tone-gold {
  color: #d4a43b;
}

.panel-wide,
.panel-side {
  padding: 22px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.panel-header span {
  color: var(--muted);
  font-size: 13px;
}

.meta-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(21, 157, 138, 0.08);
}

.meta-card + .meta-card {
  margin-top: 14px;
}

.meta-card label {
  display: block;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 10px;
}

.meta-card strong {
  font-size: 18px;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.62);
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

.upload-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
  width: 100%;
}

.upload-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.image-preview {
  margin-top: 12px;
  width: 180px;
  height: 120px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(21, 157, 138, 0.1);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.gallery-preview {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(21, 157, 138, 0.1);
}

@media (max-width: 1280px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .login-card,
  .overview-grid,
  .double-grid,
  .triple-grid,
  .preview-grid,
  .upload-field {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-chip {
    max-width: none;
  }
}
</style>
