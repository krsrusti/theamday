package com.themeos.launcher

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.FrameLayout
import android.widget.GridView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.concurrent.thread

class LauncherActivity : Activity() {

    private val ui = Handler(Looper.getMainLooper())
    private var apps: List<AppEntry> = emptyList()

    private lateinit var homeLayer: FrameLayout
    private lateinit var dockRow: LinearLayout
    private lateinit var openDrawerBtn: TextView
    private lateinit var drawerLayer: LinearLayout
    private lateinit var grid: GridView
    private val adapter = AppAdapter()

    // theme values (defaults = "default theme")
    private var bg = Color.parseColor("#101114")
    private var surface = Color.parseColor("#1C1D22")
    private var primary = Color.parseColor("#8AB4F8")
    private var textColor = Color.WHITE
    private var columns = 4
    private var dockEnabled = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        buildUi()
        thread {
            val loaded = InstalledAppsRepository.load(this)
            ui.post { apps = loaded; refresh() }
        }
    }

    override fun onResume() {
        super.onResume()
        loadTheme()
        refresh()
    }

    override fun onNewIntent(intent: android.content.Intent?) {
        super.onNewIntent(intent)
        closeDrawer() // Home button pressed while open
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (drawerLayer.visibility == View.VISIBLE) closeDrawer() // on home screen: do nothing (launcher)
    }

    // ---------- UI ----------
    private fun buildUi() {
        val root = FrameLayout(this).apply { fitsSystemWindows = true }

        homeLayer = FrameLayout(this)
        dockRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER; setPadding(dp(8), dp(8), dp(8), dp(8)) }
        homeLayer.addView(dockRow, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM).apply { setMargins(dp(12), 0, dp(12), dp(16)) })
        openDrawerBtn = TextView(this).apply {
            this.text = "⌃  All apps"; textSize = 14f; gravity = Gravity.CENTER
            setPadding(dp(16), dp(10), dp(16), dp(10))
            setOnClickListener { openDrawer() }
        }
        homeLayer.addView(openDrawerBtn, FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL).apply { bottomMargin = dp(120) })

        drawerLayer = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; visibility = View.GONE; setPadding(dp(8), dp(16), dp(8), dp(8)) }
        grid = GridView(this).apply {
        this.adapter = this@LauncherActivity.adapter
        verticalSpacing = dp(12)
        setSelector(android.graphics.drawable.ColorDrawable(Color.TRANSPARENT))
        }
        drawerLayer.addView(grid, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))

        root.addView(homeLayer, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        root.addView(drawerLayer, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        setContentView(root)
    }

    private fun loadTheme() {
        val t = try { ThemeRepository.getActive(this) } catch (e: Exception) { null } ?: return
        try {
            val a = t.getJSONObject("appearance")
            bg = Color.parseColor(a.getString("background"))
            surface = Color.parseColor(a.getString("surface"))
            primary = Color.parseColor(a.getString("primary"))
            textColor = Color.parseColor(a.getString("text"))
            val l = t.getJSONObject("layout")
            columns = l.getInt("columns")
            dockEnabled = l.optBoolean("dockEnabled", true)
        } catch (e: Exception) { /* keep previous values */ }
    }

    private fun refresh() {
        grid.numColumns = columns
        drawerLayer.setBackgroundColor((bg and 0x00FFFFFF) or (0xE8 shl 24))
        openDrawerBtn.setTextColor(textColor)
        openDrawerBtn.background = pill(surface, 999)

        dockRow.removeAllViews()
        dockRow.background = pill(surface, 28)
        dockRow.visibility = if (dockEnabled) View.VISIBLE else View.GONE
        pickDock().forEach { app ->
            dockRow.addView(cell(app, showLabel = false), LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        }
        adapter.notifyDataSetChanged()
    }

    private fun pickDock(): List<AppEntry> {
        val prefs = listOf("dialer", "phone", "messag", "mms", "camera", "chrome")
        val picked = linkedSetOf<AppEntry>()
        for (p in prefs) apps.firstOrNull { it.packageName.contains(p, true) }?.let { picked.add(it) }
        for (a in apps) { if (picked.size >= 4) break; picked.add(a) }
        return picked.take(4)
    }

    private fun openDrawer() { drawerLayer.visibility = View.VISIBLE; homeLayer.visibility = View.GONE }
    private fun closeDrawer() { drawerLayer.visibility = View.GONE; homeLayer.visibility = View.VISIBLE }

    private fun cell(app: AppEntry, showLabel: Boolean = true): View {
        val c = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(4), dp(8), dp(4), dp(8))
            setOnClickListener { InstalledAppsRepository.launch(this@LauncherActivity, app); closeDrawer() }
        }
        c.addView(ImageView(this).apply { setImageDrawable(app.icon) }, LinearLayout.LayoutParams(dp(48), dp(48)))
        if (showLabel) c.addView(TextView(this).apply {
            this.text = app.label; setTextColor(textColor); setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END; gravity = Gravity.CENTER
        })
        return c
    }

    private fun pill(color: Int, radiusDp: Int) = GradientDrawable().apply {
        setColor((color and 0x00FFFFFF) or (0xCC shl 24)); cornerRadius = dp(radiusDp).toFloat()
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private inner class AppAdapter : BaseAdapter() {
        override fun getCount() = apps.size
        override fun getItem(i: Int) = apps[i]
        override fun getItemId(i: Int) = i.toLong()
        override fun getView(i: Int, convert: View?, parent: ViewGroup?) = cell(apps[i])
    }
}
